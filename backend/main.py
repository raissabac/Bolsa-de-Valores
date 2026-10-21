from decimal import Decimal
from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, Response, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import func, text
from sqlalchemy.orm import Session, joinedload

from database import SessionLocal, engine
from models import Ativo, Carteira, Ordem, Posicao, Sessao, Usuario
from schemas import (
    AtivoSchema,
    CarteiraResponse,
    InvestidorSchema,
    LoginRequest,
    LoginResponse,
    OrdemAbertaSchema,
    OrdemRequest,
    OrdemResponse,
    PosicaoSchema,
)
from security import verify_password
from websocket_manager import ConnectionManager


app = FastAPI(title="Simulador de Bolsa de Valores")
manager = ConnectionManager()
security = HTTPBearer(auto_error=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    """Fornece uma sessão SQLAlchemy e garante seu fechamento após a requisição."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def obter_sessao_por_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> Sessao:
    """Valida o token Bearer e retorna a sessão persistida no banco."""
    if credentials is None or not credentials.credentials.strip():
        raise HTTPException(
            status_code=401,
            detail="Cabeçalho de autorização ausente ou malformatado",
        )

    token = credentials.credentials.strip()
    sessao = db.query(Sessao).filter(Sessao.token_sessao == token).first()
    if sessao is None:
        raise HTTPException(
            status_code=401,
            detail="Token inválido ou sessão expirada",
        )
    return sessao


def obter_usuario_por_token(
    sessao: Sessao = Depends(obter_sessao_por_token),
) -> int:
    """Retorna o ID do usuário associado à sessão autenticada."""
    return sessao.usuario_id


@app.get("/health")
def health_check():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}


@app.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == payload.email).first()
    if usuario is None or not verify_password(payload.senha, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    token_sessao = str(uuid4())
    sessao = Sessao(usuario_id=usuario.id, token_sessao=token_sessao)
    db.add(sessao)
    db.commit()

    return LoginResponse(
        sucesso=True,
        token_sessao=token_sessao,
        investidor=InvestidorSchema.model_validate(usuario),
    )


@app.post("/auth/logout", status_code=204)
def logout(
    sessao: Sessao = Depends(obter_sessao_por_token),
    db: Session = Depends(get_db),
):
    """Revoga a sessão usada para autenticar esta requisição."""
    db.delete(sessao)
    db.commit()
    return Response(status_code=204)


@app.get("/ativos", response_model=list[AtivoSchema])
def listar_ativos(db: Session = Depends(get_db)):
    return db.query(Ativo).order_by(Ativo.id).all()


@app.get("/carteira", response_model=CarteiraResponse)
def consultar_carteira(
    usuario_id: int = Depends(obter_usuario_por_token),
    db: Session = Depends(get_db),
):
    carteira = (
        db.query(Carteira)
        .options(joinedload(Carteira.posicoes).joinedload(Posicao.ativo))
        .filter(Carteira.usuario_id == usuario_id)
        .first()
    )
    if carteira is None:
        raise HTTPException(status_code=404, detail="Carteira não encontrada")

    posicoes = [
        PosicaoSchema(
            ativo_codigo=posicao.ativo.codigo,
            quantidade=posicao.quantidade,
            preco_medio=float(posicao.preco_medio),
        )
        for posicao in carteira.posicoes
    ]
    valor_posicoes = sum(
        posicao.quantidade * float(posicao.ativo.preco_inicial)
        for posicao in carteira.posicoes
    )
    saldo_disponivel = float(carteira.saldo_disponivel)

    return CarteiraResponse(
        investidor_id=usuario_id,
        saldo_disponivel=saldo_disponivel,
        patrimonio_total=saldo_disponivel + valor_posicoes,
        posicoes=posicoes,
    )


@app.post("/ordens", response_model=OrdemResponse, status_code=201)
async def registrar_ordem(
    payload: OrdemRequest,
    usuario_id: int = Depends(obter_usuario_por_token),
    db: Session = Depends(get_db),
):
    ativo = db.query(Ativo).filter(Ativo.codigo == payload.ativo_codigo).first()
    if ativo is None:
        raise HTTPException(status_code=404, detail="Ativo não encontrado")

    carteira = db.query(Carteira).filter(Carteira.usuario_id == usuario_id).first()
    if carteira is None:
        raise HTTPException(status_code=404, detail="Carteira não encontrada")

    preco_limite = Decimal(str(payload.preco_limite))
    if payload.tipo_operacao == "COMPRA":
        total = preco_limite * payload.quantidade
        if carteira.saldo_disponivel < total:
            raise HTTPException(status_code=400, detail="Saldo insuficiente")
    else:  # VENDA
        quantidade_disponivel = (
            db.query(func.coalesce(func.sum(Posicao.quantidade), 0))
            .filter(
                Posicao.carteira_id == carteira.id,
                Posicao.ativo_id == ativo.id,
            )
            .scalar()
        )
        if quantidade_disponivel < payload.quantidade:
            raise HTTPException(
                status_code=400,
                detail="Quantidade de ativos insuficiente para venda",
            )

    ordem = Ordem(
        usuario_id=usuario_id,
        ativo_id=ativo.id,
        tipo_operacao=payload.tipo_operacao,
        quantidade=payload.quantidade,
        preco_limite=preco_limite,
        status="REGISTRADA",
    )
    db.add(ordem)
    db.commit()
    db.refresh(ordem)

    data_registro = ordem.data_criacao.isoformat()
    dados_evento = {
        "ordem_id": ordem.id,
        "ativo_codigo": ativo.codigo,
        "tipo_operacao": ordem.tipo_operacao,
        "quantidade": ordem.quantidade,
        "preco_limite": float(ordem.preco_limite),
        "status": ordem.status,
        "data_registro": data_registro,
    }
    await manager.broadcast({"evento": "NOVA_ORDEM", "dados": dados_evento})

    return OrdemResponse(
        ordem_id=ordem.id,
        status=ordem.status,
        mensagem="Ordem registrada com sucesso",
        data_registro=data_registro,
    )



@app.get("/ordens/abertas", response_model=list[OrdemAbertaSchema])
def listar_ordens_abertas(db: Session = Depends(get_db)):
    """Retorna todas as ordens com status REGISTRADA (livro de ofertas público)."""
    ordens = (
        db.query(Ordem)
        .options(joinedload(Ordem.ativo))
        .filter(Ordem.status == "REGISTRADA")
        .order_by(Ordem.data_criacao.desc())
        .all()
    )
    return [
        OrdemAbertaSchema(
            ordem_id=ordem.id,
            ativo_codigo=ordem.ativo.codigo,
            tipo_operacao=ordem.tipo_operacao,
            quantidade=ordem.quantidade,
            preco_limite=float(ordem.preco_limite),
            status=ordem.status,
            data_registro=ordem.data_criacao.isoformat(),
        )
        for ordem in ordens
    ]


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except Exception:
        pass
    finally:
        manager.disconnect(websocket)

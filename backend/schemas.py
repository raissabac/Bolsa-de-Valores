from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class LoginRequest(BaseModel):
    email: str
    senha: str


class InvestidorSchema(BaseModel):
    id: int
    nome: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class LoginResponse(BaseModel):
    sucesso: bool
    token_sessao: str
    investidor: InvestidorSchema


class AtivoSchema(BaseModel):
    id: int
    codigo: str
    nome_empresa: str
    preco_inicial: float

    model_config = ConfigDict(from_attributes=True)


class PosicaoSchema(BaseModel):
    ativo_codigo: str
    quantidade: int
    preco_medio: float


class CarteiraResponse(BaseModel):
    investidor_id: int
    saldo_disponivel: float
    patrimonio_total: float
    posicoes: list[PosicaoSchema]


class OrdemRequest(BaseModel):
    ativo_codigo: str
    tipo_operacao: Literal["COMPRA", "VENDA"]
    quantidade: int = Field(gt=0)
    preco_limite: float = Field(gt=0)


class OrdemResponse(BaseModel):
    ordem_id: int
    status: str
    mensagem: str
    data_registro: str


class OrdemAbertaSchema(BaseModel):
    ordem_id: int
    ativo_codigo: str
    tipo_operacao: str
    quantidade: int
    preco_limite: float
    status: str
    data_registro: str

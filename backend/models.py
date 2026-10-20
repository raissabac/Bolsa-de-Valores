from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, text
from sqlalchemy.orm import relationship

from database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    senha_hash = Column(String(255), nullable=False)
    data_criacao = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    sessoes = relationship("Sessao", back_populates="usuario", cascade="all, delete-orphan")
    carteiras = relationship("Carteira", back_populates="usuario", cascade="all, delete-orphan")
    ordens = relationship("Ordem", back_populates="usuario", cascade="all, delete-orphan")


class Sessao(Base):
    __tablename__ = "sessoes"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    token_sessao = Column(String(255), nullable=False, unique=True)
    data_criacao = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    usuario = relationship("Usuario", back_populates="sessoes")


class Ativo(Base):
    __tablename__ = "ativos"

    id = Column(Integer, primary_key=True)
    codigo = Column(String(10), nullable=False, unique=True)
    nome_empresa = Column(String(100), nullable=False)
    preco_inicial = Column(Numeric(10, 2), nullable=False)

    posicoes = relationship("Posicao", back_populates="ativo")
    ordens = relationship("Ordem", back_populates="ativo")


class Carteira(Base):
    __tablename__ = "carteiras"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    saldo_disponivel = Column(
        Numeric(12, 2),
        nullable=False,
        server_default=text("10000.00"),
    )

    usuario = relationship("Usuario", back_populates="carteiras")
    posicoes = relationship("Posicao", back_populates="carteira", cascade="all, delete-orphan")


class Posicao(Base):
    __tablename__ = "posicoes"

    id = Column(Integer, primary_key=True)
    carteira_id = Column(Integer, ForeignKey("carteiras.id"), nullable=False)
    ativo_id = Column(Integer, ForeignKey("ativos.id"), nullable=False)
    quantidade = Column(Integer, nullable=False, server_default=text("0"))
    preco_medio = Column(Numeric(10, 2), nullable=False)

    carteira = relationship("Carteira", back_populates="posicoes")
    ativo = relationship("Ativo", back_populates="posicoes")


class Ordem(Base):
    __tablename__ = "ordens"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    ativo_id = Column(Integer, ForeignKey("ativos.id"), nullable=False)
    tipo_operacao = Column(String(10), nullable=False)
    quantidade = Column(Integer, nullable=False)
    preco_limite = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), nullable=False, server_default=text("'REGISTRADA'"))
    data_criacao = Column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    usuario = relationship("Usuario", back_populates="ordens")
    ativo = relationship("Ativo", back_populates="ordens")


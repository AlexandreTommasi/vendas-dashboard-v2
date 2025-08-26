-- Schema do Sistema de Vendas
-- Tabelas principais do sistema

CREATE TABLE vendedores (
    id INT PRIMARY KEY IDENTITY(1,1),
    nome NVARCHAR(200) NOT NULL,
    email NVARCHAR(200) UNIQUE NOT NULL,
    telefone NVARCHAR(20),
    meta_mensal DECIMAL(10,2),
    comissao_percentual DECIMAL(5,2) DEFAULT 5.00,
    ativo BIT DEFAULT 1,
    criado_em DATETIME DEFAULT GETDATE()
);

CREATE TABLE clientes (
    id INT PRIMARY KEY IDENTITY(1,1),
    nome NVARCHAR(200) NOT NULL,
    email NVARCHAR(200) UNIQUE NOT NULL,
    telefone NVARCHAR(20),
    cpf_cnpj NVARCHAR(20) UNIQUE,
    endereco NVARCHAR(500),
    cidade NVARCHAR(100),
    estado NVARCHAR(2),
    cep NVARCHAR(10),
    criado_em DATETIME DEFAULT GETDATE()
);

CREATE TABLE produtos (
    id INT PRIMARY KEY IDENTITY(1,1),
    nome NVARCHAR(200) NOT NULL,
    descricao NVARCHAR(MAX),
    preco DECIMAL(10,2) NOT NULL,
    custo DECIMAL(10,2),
    estoque INT DEFAULT 0,
    estoque_minimo INT DEFAULT 10,
    codigo_barras NVARCHAR(50) UNIQUE,
    ativo BIT DEFAULT 1,
    criado_em DATETIME DEFAULT GETDATE()
);

CREATE TABLE vendas (
    id INT PRIMARY KEY IDENTITY(1,1),
    vendedor_id INT NOT NULL,
    cliente_id INT NOT NULL,
    data_venda DATETIME DEFAULT GETDATE(),
    valor_total DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0,
    valor_final DECIMAL(10,2) NOT NULL,
    status NVARCHAR(50) DEFAULT 'concluida',
    observacoes NVARCHAR(MAX),
    FOREIGN KEY (vendedor_id) REFERENCES vendedores(id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE itens_venda (
    id INT PRIMARY KEY IDENTITY(1,1),
    venda_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (venda_id) REFERENCES vendas(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- Índices para performance
CREATE INDEX idx_vendas_vendedor ON vendas(vendedor_id);
CREATE INDEX idx_vendas_cliente ON vendas(cliente_id);
CREATE INDEX idx_vendas_data ON vendas(data_venda);
CREATE INDEX idx_itens_venda ON itens_venda(venda_id);
CREATE INDEX idx_produtos_codigo ON produtos(codigo_barras);
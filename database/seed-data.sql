-- Dados iniciais para o Sistema de Vendas

-- Inserir Vendedores
INSERT INTO vendedores (nome, email, telefone, meta_mensal, comissao_percentual) VALUES 
('Carlos Silva', 'carlos@vendas.com', '11987654321', 50000.00, 5.00),
('Ana Costa', 'ana@vendas.com', '11976543210', 45000.00, 5.50),
('Pedro Santos', 'pedro@vendas.com', '11965432109', 40000.00, 4.50),
('Maria Oliveira', 'maria@vendas.com', '11954321098', 55000.00, 6.00),
('João Ferreira', 'joao@vendas.com', '11943210987', 35000.00, 4.00);

-- Inserir Clientes
INSERT INTO clientes (nome, email, telefone, cpf_cnpj, cidade, estado) VALUES 
('Tech Solutions Ltda', 'contato@techsolutions.com', '1133334444', '12.345.678/0001-90', 'São Paulo', 'SP'),
('João da Silva', 'joao.silva@email.com', '11999998888', '123.456.789-00', 'Rio de Janeiro', 'RJ'),
('Empresa ABC', 'compras@abc.com', '1122223333', '98.765.432/0001-10', 'Belo Horizonte', 'MG'),
('Maria Santos', 'maria.santos@email.com', '11888887777', '987.654.321-00', 'Curitiba', 'PR'),
('Comércio XYZ', 'vendas@xyz.com', '1144445555', '11.222.333/0001-44', 'Porto Alegre', 'RS'),
('Pedro Oliveira', 'pedro@email.com', '11777776666', '456.789.123-00', 'Salvador', 'BA'),
('Indústria 123', 'contato@ind123.com', '1155556666', '33.444.555/0001-66', 'Recife', 'PE'),
('Ana Costa', 'ana.costa@email.com', '11666665555', '789.123.456-00', 'Fortaleza', 'CE'),
('Serviços Rápidos', 'admin@servicos.com', '1166667777', '55.666.777/0001-88', 'Brasília', 'DF'),
('Carlos Souza', 'carlos@email.com', '11555554444', '321.654.987-00', 'Campinas', 'SP');

-- Inserir Produtos
INSERT INTO produtos (nome, descricao, preco, custo, estoque, estoque_minimo, codigo_barras) VALUES 
('Notebook Pro', 'Notebook profissional i7 16GB RAM', 4500.00, 3200.00, 25, 5, '7891234567890'),
('Mouse Wireless', 'Mouse sem fio ergonômico', 89.90, 45.00, 150, 20, '7891234567891'),
('Teclado Mecânico', 'Teclado mecânico RGB', 350.00, 180.00, 80, 10, '7891234567892'),
('Monitor 27"', 'Monitor Full HD IPS', 1200.00, 750.00, 45, 5, '7891234567893'),
('Webcam HD', 'Webcam 1080p com microfone', 250.00, 120.00, 60, 10, '7891234567894'),
('Headset Gamer', 'Headset com cancelamento de ruído', 450.00, 250.00, 90, 15, '7891234567895'),
('SSD 1TB', 'SSD NVMe 1TB alta velocidade', 650.00, 400.00, 120, 20, '7891234567896'),
('Memória RAM 16GB', 'Memória DDR4 3200MHz', 380.00, 220.00, 200, 30, '7891234567897'),
('Placa de Vídeo', 'GPU Gaming 8GB', 3200.00, 2400.00, 15, 3, '7891234567898'),
('Processador i5', 'Processador Intel i5 12ª geração', 1800.00, 1300.00, 35, 5, '7891234567899'),
('Gabinete Gamer', 'Gabinete com lateral de vidro', 450.00, 250.00, 50, 10, '7891234567900'),
('Fonte 650W', 'Fonte 80 Plus Bronze', 380.00, 200.00, 70, 15, '7891234567901'),
('Cooler CPU', 'Cooler para processador RGB', 180.00, 90.00, 100, 20, '7891234567902'),
('Hub USB', 'Hub USB 3.0 7 portas', 120.00, 60.00, 180, 25, '7891234567903'),
('Cabo HDMI', 'Cabo HDMI 2.1 2 metros', 45.00, 20.00, 300, 50, '7891234567904');

-- Inserir Vendas
INSERT INTO vendas (vendedor_id, cliente_id, data_venda, valor_total, desconto, valor_final, status) VALUES 
(1, 1, DATEADD(day, -10, GETDATE()), 9000.00, 450.00, 8550.00, 'concluida'),
(2, 2, DATEADD(day, -8, GETDATE()), 4500.00, 0, 4500.00, 'concluida'),
(3, 3, DATEADD(day, -7, GETDATE()), 2850.00, 150.00, 2700.00, 'concluida'),
(1, 4, DATEADD(day, -5, GETDATE()), 1580.00, 80.00, 1500.00, 'concluida'),
(4, 5, DATEADD(day, -4, GETDATE()), 7200.00, 200.00, 7000.00, 'concluida'),
(2, 6, DATEADD(day, -3, GETDATE()), 890.00, 0, 890.00, 'concluida'),
(5, 7, DATEADD(day, -2, GETDATE()), 3450.00, 100.00, 3350.00, 'concluida'),
(3, 8, DATEADD(day, -1, GETDATE()), 5600.00, 300.00, 5300.00, 'concluida'),
(1, 9, GETDATE(), 2250.00, 50.00, 2200.00, 'concluida'),
(4, 10, GETDATE(), 1350.00, 0, 1350.00, 'pendente');

-- Inserir Itens das Vendas
INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, desconto, subtotal) VALUES 
-- Venda 1
(1, 1, 2, 4500.00, 450.00, 8550.00),

-- Venda 2  
(2, 1, 1, 4500.00, 0, 4500.00),

-- Venda 3
(3, 7, 2, 650.00, 0, 1300.00),
(3, 8, 4, 380.00, 100.00, 1420.00),

-- Venda 4
(4, 2, 4, 89.90, 0, 359.60),
(4, 3, 2, 350.00, 50.00, 650.00),
(4, 5, 2, 250.00, 0, 500.00),

-- Venda 5
(5, 9, 2, 3200.00, 200.00, 6200.00),
(5, 12, 2, 380.00, 0, 760.00),

-- Venda 6
(6, 2, 10, 89.90, 0, 899.00),

-- Venda 7
(7, 4, 2, 1200.00, 100.00, 2300.00),
(7, 6, 2, 450.00, 0, 900.00),

-- Venda 8
(8, 10, 2, 1800.00, 200.00, 3400.00),
(8, 11, 4, 450.00, 100.00, 1700.00),

-- Venda 9
(9, 3, 3, 350.00, 0, 1050.00),
(9, 4, 1, 1200.00, 50.00, 1150.00),

-- Venda 10
(10, 13, 5, 180.00, 0, 900.00),
(10, 14, 10, 45.00, 0, 450.00);
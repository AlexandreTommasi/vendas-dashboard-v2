const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do banco - Variáveis vêm do Azure App Settings
const dbConfig = {
  server: process.env.DATABASE_SERVER,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    connectTimeout: 30000
  }
};

let pool;

// Conectar ao banco
async function connectDB() {
  try {
    pool = await sql.connect(dbConfig);
    console.log('✅ Conectado ao Azure SQL Database');
    return true;
  } catch (err) {
    console.error('❌ Erro ao conectar:', err.message);
    return false;
  }
}

// Rota principal - Interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Status da API
app.get('/api', (req, res) => {
  res.json({
    app: 'Sistema de Vendas API',
    version: '1.0.0',
    status: 'online',
    database: pool && pool.connected ? 'conectado' : 'desconectado'
  });
});

// Teste de conexão
app.get('/api/test-connection', async (req, res) => {
  try {
    const result = await pool.request()
      .query('SELECT GETDATE() as hora, DB_NAME() as banco');
    res.json({
      success: true,
      ...result.recordset[0]
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Dashboard com métricas
app.get('/api/dashboard', async (req, res) => {
  try {
    const stats = await pool.request().query(`
      SELECT 
        (SELECT COUNT(*) FROM vendedores WHERE ativo = 1) as total_vendedores,
        (SELECT COUNT(*) FROM clientes) as total_clientes,
        (SELECT COUNT(*) FROM produtos WHERE ativo = 1) as total_produtos,
        (SELECT COUNT(*) FROM vendas) as total_vendas,
        (SELECT ISNULL(SUM(valor_final), 0) FROM vendas WHERE status = 'concluida') as receita_total,
        (SELECT ISNULL(SUM(valor_final), 0) FROM vendas 
         WHERE status = 'concluida' 
         AND MONTH(data_venda) = MONTH(GETDATE()) 
         AND YEAR(data_venda) = YEAR(GETDATE())) as receita_mes,
        (SELECT COUNT(*) FROM produtos WHERE estoque <= estoque_minimo) as produtos_estoque_baixo
    `);
    
    res.json({
      success: true,
      stats: stats.recordset[0]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API de Vendedores
app.get('/api/vendedores', async (req, res) => {
  try {
    const result = await pool.request()
      .query(`
        SELECT v.*,
               COUNT(vd.id) as total_vendas,
               ISNULL(SUM(vd.valor_final), 0) as total_vendido
        FROM vendedores v
        LEFT JOIN vendas vd ON v.id = vd.vendedor_id
        WHERE v.ativo = 1
        GROUP BY v.id, v.nome, v.email, v.telefone, v.meta_mensal, v.comissao_percentual, v.ativo, v.criado_em
        ORDER BY total_vendido DESC
      `);
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API de Produtos
app.get('/api/produtos', async (req, res) => {
  try {
    const result = await pool.request()
      .query(`
        SELECT *,
               CASE 
                 WHEN estoque <= estoque_minimo THEN 'baixo'
                 WHEN estoque > estoque_minimo * 2 THEN 'alto'
                 ELSE 'normal'
               END as status_estoque
        FROM produtos
        WHERE ativo = 1
        ORDER BY nome
      `);
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API de Clientes
app.get('/api/clientes', async (req, res) => {
  try {
    const result = await pool.request()
      .query(`
        SELECT c.*,
               COUNT(v.id) as total_compras,
               ISNULL(SUM(v.valor_final), 0) as total_gasto
        FROM clientes c
        LEFT JOIN vendas v ON c.id = v.cliente_id
        GROUP BY c.id, c.nome, c.email, c.telefone, c.cpf_cnpj, c.endereco, c.cidade, c.estado, c.cep, c.criado_em
        ORDER BY total_gasto DESC
      `);
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API de Vendas
app.get('/api/vendas', async (req, res) => {
  try {
    const result = await pool.request()
      .query(`
        SELECT v.*,
               vd.nome as vendedor_nome,
               c.nome as cliente_nome,
               (SELECT COUNT(*) FROM itens_venda WHERE venda_id = v.id) as total_itens
        FROM vendas v
        INNER JOIN vendedores vd ON v.vendedor_id = vd.id
        INNER JOIN clientes c ON v.cliente_id = c.id
        ORDER BY v.data_venda DESC
      `);
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Detalhes de uma venda
app.get('/api/vendas/:id', async (req, res) => {
  try {
    const venda = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT v.*,
               vd.nome as vendedor_nome,
               c.nome as cliente_nome,
               c.email as cliente_email
        FROM vendas v
        INNER JOIN vendedores vd ON v.vendedor_id = vd.id
        INNER JOIN clientes c ON v.cliente_id = c.id
        WHERE v.id = @id
      `);
    
    if (venda.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'Venda não encontrada' });
    }
    
    const itens = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT i.*,
               p.nome as produto_nome,
               p.codigo_barras
        FROM itens_venda i
        INNER JOIN produtos p ON i.produto_id = p.id
        WHERE i.venda_id = @id
      `);
    
    res.json({
      success: true,
      data: {
        ...venda.recordset[0],
        itens: itens.recordset
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Ranking de vendedores
app.get('/api/ranking-vendedores', async (req, res) => {
  try {
    const result = await pool.request()
      .query(`
        SELECT TOP 5
               v.nome,
               COUNT(vd.id) as total_vendas,
               ISNULL(SUM(vd.valor_final), 0) as total_vendido,
               v.meta_mensal,
               CASE 
                 WHEN v.meta_mensal > 0 
                 THEN (ISNULL(SUM(vd.valor_final), 0) / v.meta_mensal * 100)
                 ELSE 0
               END as percentual_meta
        FROM vendedores v
        LEFT JOIN vendas vd ON v.id = vd.vendedor_id
          AND MONTH(vd.data_venda) = MONTH(GETDATE())
          AND YEAR(vd.data_venda) = YEAR(GETDATE())
        WHERE v.ativo = 1
        GROUP BY v.id, v.nome, v.meta_mensal
        ORDER BY total_vendido DESC
      `);
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Produtos mais vendidos
app.get('/api/produtos-mais-vendidos', async (req, res) => {
  try {
    const result = await pool.request()
      .query(`
        SELECT TOP 10
               p.nome,
               SUM(iv.quantidade) as quantidade_vendida,
               SUM(iv.subtotal) as receita_gerada
        FROM produtos p
        INNER JOIN itens_venda iv ON p.id = iv.produto_id
        GROUP BY p.id, p.nome
        ORDER BY quantidade_vendida DESC
      `);
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: pool && pool.connected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Inicializar servidor
const server = app.listen(port, async () => {
  console.log(`🚀 Sistema de Vendas rodando na porta ${port}`);
  console.log(`📦 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  
  const connected = await connectDB();
  if (connected) {
    try {
      const result = await pool.request()
        .query('SELECT COUNT(*) as tabelas FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = \'BASE TABLE\'');
      console.log(`📊 Tabelas no banco: ${result.recordset[0].tabelas}`);
    } catch (err) {
      console.log('⚠️ Aguardando criação das tabelas...');
    }
  }
});

module.exports = server;
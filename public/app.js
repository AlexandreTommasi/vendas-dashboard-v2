// Estado global
let vendas = [];
let vendedores = [];
let produtos = [];
let clientes = [];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    verificarConexao();
    carregarDashboard();
    carregarRankingVendedores();
    carregarProdutosMaisVendidos();
    carregarVendas();
    
    // Atualizar a cada 30 segundos
    setInterval(() => {
        carregarDashboard();
        carregarVendas();
    }, 30000);
});

// Verificar conexão com banco
async function verificarConexao() {
    try {
        const response = await fetch('/api/test-connection');
        const data = await response.json();
        
        const statusEl = document.getElementById('db-status');
        if (data.success) {
            statusEl.textContent = `✅ Conectado: ${data.banco}`;
            statusEl.className = 'status-badge connected';
        } else {
            statusEl.textContent = '❌ Desconectado';
            statusEl.className = 'status-badge disconnected';
        }
    } catch (error) {
        const statusEl = document.getElementById('db-status');
        statusEl.textContent = '❌ Erro de conexão';
        statusEl.className = 'status-badge disconnected';
    }
}

// Carregar dashboard
async function carregarDashboard() {
    try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        
        if (data.success) {
            const stats = data.stats;
            
            // Atualizar valores
            document.getElementById('receita-total').textContent = formatarMoeda(stats.receita_total);
            document.getElementById('receita-mes').textContent = formatarMoeda(stats.receita_mes);
            document.getElementById('total-vendas').textContent = stats.total_vendas;
            document.getElementById('produtos-baixo').textContent = stats.produtos_estoque_baixo;
            document.getElementById('total-vendedores').textContent = stats.total_vendedores;
            document.getElementById('vendedores-ativos').textContent = stats.total_vendedores;
            document.getElementById('total-clientes').textContent = stats.total_clientes;
            document.getElementById('clientes-mes').textContent = Math.floor(stats.total_clientes * 0.15);
            document.getElementById('total-produtos').textContent = stats.total_produtos;
            document.getElementById('produtos-falta').textContent = stats.produtos_estoque_baixo;
        }
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

// Carregar ranking de vendedores
async function carregarRankingVendedores() {
    try {
        const response = await fetch('/api/ranking-vendedores');
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            const container = document.getElementById('ranking-vendedores');
            container.innerHTML = '';
            
            data.data.forEach((vendedor, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
                
                const item = document.createElement('div');
                item.className = 'ranking-item';
                item.innerHTML = `
                    <div class="ranking-position">${medal}</div>
                    <div class="ranking-info">
                        <div class="ranking-name">${vendedor.nome}</div>
                        <div class="ranking-stats">
                            <span>Vendas: ${vendedor.total_vendas}</span>
                            <span>Meta: ${Math.round(vendedor.percentual_meta || 0)}%</span>
                        </div>
                    </div>
                    <div class="ranking-value">${formatarMoeda(vendedor.total_vendido)}</div>
                `;
                container.appendChild(item);
            });
        } else {
            document.getElementById('ranking-vendedores').innerHTML = '<div class="loading">Nenhum vendedor encontrado</div>';
        }
    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        document.getElementById('ranking-vendedores').innerHTML = '<div class="loading">Erro ao carregar dados</div>';
    }
}

// Carregar produtos mais vendidos
async function carregarProdutosMaisVendidos() {
    try {
        const response = await fetch('/api/produtos-mais-vendidos');
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            const container = document.getElementById('produtos-top');
            container.innerHTML = '';
            
            const maxQuantidade = Math.max(...data.data.map(p => p.quantidade_vendida));
            
            data.data.slice(0, 5).forEach(produto => {
                const percentage = (produto.quantidade_vendida / maxQuantidade) * 100;
                
                const bar = document.createElement('div');
                bar.className = 'chart-bar';
                bar.innerHTML = `
                    <div class="chart-label">${produto.nome}</div>
                    <div class="chart-progress">
                        <div class="chart-fill" style="width: ${percentage}%">
                            ${produto.quantidade_vendida} un
                        </div>
                    </div>
                    <div class="chart-value">${formatarMoeda(produto.receita_gerada)}</div>
                `;
                container.appendChild(bar);
            });
        } else {
            document.getElementById('produtos-top').innerHTML = '<div class="loading">Nenhum produto vendido</div>';
        }
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        document.getElementById('produtos-top').innerHTML = '<div class="loading">Erro ao carregar dados</div>';
    }
}

// Carregar vendas
async function carregarVendas() {
    try {
        const response = await fetch('/api/vendas');
        const data = await response.json();
        
        if (data.success) {
            vendas = data.data;
            renderizarTabelaVendas();
        }
    } catch (error) {
        console.error('Erro ao carregar vendas:', error);
    }
}

// Renderizar tabela de vendas
function renderizarTabelaVendas() {
    const tbody = document.querySelector('#vendas-table tbody');
    
    if (vendas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">Nenhuma venda encontrada</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    vendas.slice(0, 10).forEach(venda => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${venda.id}</td>
            <td>${formatarData(venda.data_venda)}</td>
            <td>${venda.cliente_nome}</td>
            <td>${venda.vendedor_nome}</td>
            <td>${formatarMoeda(venda.valor_final)}</td>
            <td><span class="status-pill ${venda.status}">${venda.status}</span></td>
            <td>
                <button class="btn-view" onclick="verDetalhesVenda(${venda.id})">Ver</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Ver detalhes da venda
async function verDetalhesVenda(id) {
    try {
        const response = await fetch(`/api/vendas/${id}`);
        const data = await response.json();
        
        if (data.success) {
            const venda = data.data;
            const modal = document.getElementById('modal');
            const modalBody = document.getElementById('modal-body');
            
            let itensHtml = '';
            venda.itens.forEach(item => {
                itensHtml += `
                    <tr>
                        <td>${item.produto_nome}</td>
                        <td>${item.quantidade}</td>
                        <td>${formatarMoeda(item.preco_unitario)}</td>
                        <td>${formatarMoeda(item.desconto)}</td>
                        <td>${formatarMoeda(item.subtotal)}</td>
                    </tr>
                `;
            });
            
            modalBody.innerHTML = `
                <h2>Detalhes da Venda #${venda.id}</h2>
                
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Data:</span>
                        <span class="info-value">${formatarData(venda.data_venda)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Cliente:</span>
                        <span class="info-value">${venda.cliente_nome}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Vendedor:</span>
                        <span class="info-value">${venda.vendedor_nome}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Status:</span>
                        <span class="info-value"><span class="status-pill ${venda.status}">${venda.status}</span></span>
                    </div>
                </div>
                
                <h3>Itens da Venda</h3>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Qtd</th>
                                <th>Preço Unit.</th>
                                <th>Desconto</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itensHtml}
                        </tbody>
                    </table>
                </div>
                
                <div class="info-grid" style="margin-top: 1.5rem;">
                    <div class="info-item">
                        <span class="info-label">Valor Total:</span>
                        <span class="info-value">${formatarMoeda(venda.valor_total)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Desconto:</span>
                        <span class="info-value text-danger">- ${formatarMoeda(venda.desconto)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label"><strong>Valor Final:</strong></span>
                        <span class="info-value"><strong>${formatarMoeda(venda.valor_final)}</strong></span>
                    </div>
                </div>
            `;
            
            modal.classList.add('show');
        }
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        alert('Erro ao carregar detalhes da venda');
    }
}

// Navegação
function verVendedores() {
    alert('Página de vendedores em desenvolvimento');
}

function verClientes() {
    alert('Página de clientes em desenvolvimento');
}

function verProdutos() {
    alert('Página de produtos em desenvolvimento');
}

// Fechar modal
function fecharModal() {
    document.getElementById('modal').classList.remove('show');
}

// Utilitários
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor || 0);
}

function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}
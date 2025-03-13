document.addEventListener('DOMContentLoaded', () => {
    const descricaoOrcamentoInput = document.getElementById('descricao-orcamento');
    const criarOrcamentoBtn = document.getElementById('criar-orcamento');
    const descricaoItemInput = document.getElementById('descricao-item');
    const valorItemInput = document.getElementById('valor-item');
    const fornecedorItemInput = document.getElementById('fornecedor-item');
    const fotoItemInput = document.getElementById('foto-item');
    const adicionarItemBtn = document.getElementById('adicionar-item');
    const listaOrcamentos = document.getElementById('lista-orcamentos');
    const listaItens = document.getElementById('lista-itens');
    const totalItensSpan = document.getElementById('total-itens');
    const nomeOrcamentoSpan = document.getElementById('nome-orcamento');
    const excluirOrcamentoBtn = document.getElementById('excluir-orcamento');
    const gerarBackupBtn = document.getElementById('gerar-backup');
    const restaurarBackupInput = document.getElementById('restaurar-backup');
    const restaurarBackupBtn = document.getElementById('restaurar-backup-btn');
    let orcamentoAtual = null;

    function imageToBase64(file, callback) {
        const reader = new FileReader();
        reader.onload = function(e) {
            callback(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    criarOrcamentoBtn.addEventListener('click', () => {
        const descricaoOrcamento = descricaoOrcamentoInput.value.trim();
        if (descricaoOrcamento) {
            const orcamento = { descricao: descricaoOrcamento, itens: [] };
            localStorage.setItem(descricaoOrcamento, JSON.stringify(orcamento));
            descricaoOrcamentoInput.value = '';
            carregarOrcamentos();
        } else {
            alert('Por favor, insira a descrição do orçamento.');
        }
    });

    function carregarOrcamentos() {
        listaOrcamentos.innerHTML = '';
        for (let i = 0; i < localStorage.length; i++) {
            const nomeOrcamento = localStorage.key(i);
            const orcamento = JSON.parse(localStorage.getItem(nomeOrcamento));
            const li = document.createElement('li');
            li.textContent = orcamento.descricao;
            const btnCarregar = document.createElement('button');
            btnCarregar.textContent = 'Carregar';
            btnCarregar.addEventListener('click', () => carregarOrcamento(nomeOrcamento));
            li.appendChild(btnCarregar);
            listaOrcamentos.appendChild(li);
        }
    }

    function carregarOrcamento(nomeOrcamento) {
        orcamentoAtual = JSON.parse(localStorage.getItem(nomeOrcamento));
        nomeOrcamentoSpan.textContent = orcamentoAtual.descricao;
        atualizarListaItens();
        verificarExclusaoOrcamento();
    }

    adicionarItemBtn.addEventListener('click', () => {
        if (!orcamentoAtual) {
            alert('Por favor, carregue um orçamento primeiro.');
            return;
        }

        const descricaoItem = descricaoItemInput.value.trim();
        const valorItem = parseFloat(valorItemInput.value);
        const fornecedorItem = fornecedorItemInput.value.trim();
        const fotoItem = fotoItemInput.files[0];

        if (descricaoItem && !isNaN(valorItem) && valorItem > 0) {
            const item = { descricao: descricaoItem, valor: valorItem.toFixed(2), fornecedor: fornecedorItem, foto: null };

            if (fotoItem) {
                imageToBase64(fotoItem, (base64Foto) => {
                    item.foto = base64Foto;
                    orcamentoAtual.itens.push(item);
                    localStorage.setItem(orcamentoAtual.descricao, JSON.stringify(orcamentoAtual));
                    atualizarListaItens();
                });
            } else {
                orcamentoAtual.itens.push(item);
                localStorage.setItem(orcamentoAtual.descricao, JSON.stringify(orcamentoAtual));
                atualizarListaItens();
            }

            descricaoItemInput.value = '';
            valorItemInput.value = '';
            fornecedorItemInput.value = '';
            fotoItemInput.value = '';
        } else {
            alert('Por favor, preencha todos os campos corretamente.');
        }
    });

    function atualizarListaItens() {
        listaItens.innerHTML = '';
        let total = 0;
        orcamentoAtual.itens.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `${item.descricao} - R$ ${item.valor} (Fornecedor: ${item.fornecedor})`;
            if (item.foto) {
                const img = document.createElement('img');
                img.src = item.foto;
                li.appendChild(img);
            }
            const btnExcluir = document.createElement('button');
            btnExcluir.textContent = 'Excluir';
            btnExcluir.addEventListener('click', () => excluirItem(index));
            li.appendChild(btnExcluir);
            listaItens.appendChild(li);
            total += parseFloat(item.valor);
        });
        totalItensSpan.textContent = total.toFixed(2);
    }

    function excluirItem(index) {
        orcamentoAtual.itens.splice(index, 1);
        localStorage.setItem(orcamentoAtual.descricao, JSON.stringify(orcamentoAtual));
        atualizarListaItens();
    }

    function verificarExclusaoOrcamento() {
        if (orcamentoAtual.itens.length === 0) {
            excluirOrcamentoBtn.style.display = 'block';
            excluirOrcamentoBtn.onclick = () => excluirOrcamento();
        } else {
            excluirOrcamentoBtn.style.display = 'none';
        }
    }

    function excluirOrcamento() {
        if (orcamentoAtual && orcamentoAtual.itens.length === 0) {
            localStorage.removeItem(orcamentoAtual.descricao);
            carregarOrcamentos();
            nomeOrcamentoSpan.textContent = 'Nenhum';
            listaItens.innerHTML = '';
            totalItensSpan.textContent = '0.00';
            alert('Orçamento excluído com sucesso!');
        }
    }

    gerarBackupBtn.addEventListener('click', () => {
        const orcamentosBackup = [];
        for (let i = 0; i < localStorage.length; i++) {
            const nomeOrcamento = localStorage.key(i);
            const orcamento = JSON.parse(localStorage.getItem(nomeOrcamento));
            orcamentosBackup.push(orcamento);
        }
        const jsonBackup = JSON.stringify(orcamentosBackup, null, 2);
        const blob = new Blob([jsonBackup], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'backup_orcamentos.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    restaurarBackupBtn.addEventListener('click', () => {
        const file = restaurarBackupInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const dados = JSON.parse(e.target.result);
                dados.forEach(orcamento => {
                    localStorage.setItem(orcamento.descricao, JSON.stringify(orcamento));
                });
                carregarOrcamentos();
                alert('Backup restaurado com sucesso!');
            };
            reader.readAsText(file);
        }
    });

    carregarOrcamentos();
});

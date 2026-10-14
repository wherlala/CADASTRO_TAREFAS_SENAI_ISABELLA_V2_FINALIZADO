class Tarefa {
    #concluida;

    constructor(descricao, concluida = false, prazo = "", prioridade = "media") {
        descricao = descricao.trim();

        if (descricao === "") {
            throw new Error("Digite uma tarefa.");
        }

        this.descricao = descricao;
        this.#concluida = concluida;
        this.prazo = prazo;
        this.prioridade = prioridade; // RF2: Prioridade da tarefa
    }

    get concluida() {
        return this.#concluida;
    }

    alternarConclusao() {
        this.#concluida = !this.#concluida;
    }

    definirPrazo(novoPrazo) {
        this.prazo = novoPrazo;
    }
}

const listaDeTarefas = [];
let filtroAtual = "todas"; // RF1: Estado inicial do filtro

const campoTarefas = document.getElementById("campo-tarefa");
const campoPrioridade = document.getElementById("campo-prioridade");
const listaTarefas = document.getElementById("lista-tarefas");
const contadorTarefas = document.getElementById("contador-tarefas");
const botaoAdicionar = document.querySelector(".botao-principal");
const botaoTema = document.getElementById("botao-alternar-tema");

// Elementos do Modal
const modalFuncionalidades = document.getElementById("modal-funcionalidades");
const botaoInfo = document.getElementById("botao-info");
const botaoFecharModal = document.getElementById("botao-fechar-modal");

// Controle do Modal
botaoInfo.addEventListener("click", () => modalFuncionalidades.showModal());
botaoFecharModal.addEventListener("click", () => modalFuncionalidades.close());

// Controle dos Botões de Filtro (RF1)
document.querySelectorAll(".botao-filtro").forEach(botao => {
    botao.addEventListener("click", (e) => {
        document.querySelectorAll(".botao-filtro").forEach(b => b.classList.remove("ativo"));
        e.target.classList.add("ativo");
        filtroAtual = e.target.dataset.filtro;
        renderizarTarefas();
    });
});

function salvarTarefas() {
    const tarefasParaSalvar = listaDeTarefas.map(function (tarefa) {
        return {
            descricao: tarefa.descricao,
            concluida: tarefa.concluida,
            prazo: tarefa.prazo,
            prioridade: tarefa.prioridade
        };
    });
    localStorage.setItem("tarefas", JSON.stringify(tarefasParaSalvar));
}

function carregarTarefas() {
    const tarefasSalvas = localStorage.getItem("tarefas");
    if (tarefasSalvas) {
        const tarefas = JSON.parse(tarefasSalvas);
        tarefas.forEach(function (tarefaSalva) {
            const tarefa = new Tarefa(
                tarefaSalva.descricao,
                tarefaSalva.concluida,
                tarefaSalva.prazo,
                tarefaSalva.prioridade || "media"
            );
            listaDeTarefas.push(tarefa);
        });
    }
    renderizarTarefas();
}

botaoAdicionar.addEventListener("click", function () {
    try {
        const descricao = campoTarefas.value;
        const prioridade = campoPrioridade.value;
        const novaTarefa = new Tarefa(descricao, false, "", prioridade);

        listaDeTarefas.push(novaTarefa);
        salvarTarefas();
        renderizarTarefas();

        campoTarefas.value = "";
        campoPrioridade.value = "media";
        campoTarefas.focus();
    } catch (erro) {
        alert(erro.message);
    }
});

campoTarefas.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        botaoAdicionar.click();
    }
});

function renderizarTarefas() {
    // Ordenação padrão
    listaDeTarefas.sort(function (a, b) {
        if (a.concluida && !b.concluida) return 1;
        if (!a.concluida && b.concluida) return -1;

        if (!a.prazo && !b.prazo) return 0;
        if (!a.prazo) return 1;
        if (!b.prazo) return -1;

        const dataA = new Date(a.prazo);
        const dataB = new Date(b.prazo);
        return dataA - dataB;
    });

    listaTarefas.innerHTML = "";

    // Aplicar Filtro (RF1)
    const tarefasFiltradas = listaDeTarefas.filter(tarefa => {
        if (filtroAtual === "pendentes") return !tarefa.concluida;
        if (filtroAtual === "concluidas") return tarefa.concluida;
        return true;
    });

    tarefasFiltradas.forEach(function (tarefa) {
        // Encontrar o índice real na lista principal para exclusão/edição correta
        const indexReal = listaDeTarefas.indexOf(tarefa);

        const item = document.createElement("li");
        item.classList.add("item-tarefa");
        item.classList.add(`prioridade-${tarefa.prioridade}`); // Estilização por prioridade

        const texto = document.createElement("span");
        texto.textContent = `[${tarefa.prioridade.toUpperCase()}] ${tarefa.descricao}`;

        if (tarefa.concluida) {
            texto.style.textDecoration = "line-through";
            texto.style.opacity = "0.5";
        } else if (tarefa.prazo) {
            const dataPrazo = new Date(tarefa.prazo + "T00:00:00");
            const dataHoje = new Date();
            dataHoje.setHours(0, 0, 0, 0);

            if (dataPrazo < dataHoje) {
                texto.style.color = "#ff4d4d";
                texto.style.fontWeight = "bold";
            }
        }

        const campoPrazo = document.createElement("input");
        campoPrazo.type = "date";
        campoPrazo.value = tarefa.prazo;
        campoPrazo.title = "Adicionar prazo";
        campoPrazo.classList.add("botao-acao", "campo-prazo");

        campoPrazo.addEventListener("change", function () {
            tarefa.definirPrazo(campoPrazo.value);
            salvarTarefas();
            renderizarTarefas();
        });

        const botaoConcluir = document.createElement("button");
        botaoConcluir.classList.add("botao-acao");
        botaoConcluir.innerHTML = tarefa.concluida ?
            `<i class="fa-solid fa-circle-check"></i>` :
            `<i class="fa-regular fa-circle"></i>`;

        botaoConcluir.addEventListener("click", function () {
            tarefa.alternarConclusao();
            salvarTarefas();
            renderizarTarefas();
        });

        const botaoExcluir = document.createElement("button");
        botaoExcluir.classList.add("botao-acao", "excluir");
        botaoExcluir.innerHTML = `<i class="fa-solid fa-trash"></i>`;

        botaoExcluir.addEventListener("click", function () {
            listaDeTarefas.splice(indexReal, 1);
            salvarTarefas();
            renderizarTarefas();
        });

        const acoes = document.createElement("div");
        acoes.classList.add("acoes-tarefa");
        acoes.appendChild(campoPrazo);
        acoes.appendChild(botaoConcluir);
        acoes.appendChild(botaoExcluir);

        item.appendChild(texto);
        item.appendChild(acoes);
        listaTarefas.appendChild(item);
    });

    atualizarContador();
}

function atualizarContador() {
    const quantidade = listaDeTarefas.length;
    if (quantidade === 0) {
        contadorTarefas.textContent = "0 tarefas na lista";
    } else if (quantidade === 1) {
        contadorTarefas.textContent = "1 tarefa na lista";
    } else {
        contadorTarefas.textContent = `${quantidade} tarefas na lista`;
    }
}

botaoTema.addEventListener("click", function () {
    document.body.classList.toggle("modo-escuro");
    const icone = botaoTema.querySelector("i");
    if (document.body.classList.contains("modo-escuro")) {
        icone.classList.remove("fa-moon");
        icone.classList.add("fa-sun");
    } else {
        icone.classList.remove("fa-sun");
        icone.classList.add("fa-moon");
    }
});

carregarTarefas();
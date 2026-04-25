// Simulador de Economia Mensal
const incomeInput = document.getElementById('income');
const expensesInput = document.getElementById('expenses');
const savingsGoalInput = document.getElementById('savingsGoal');
const savingsGoalValue = document.getElementById('savingsGoalValue');
const resultsDiv = document.getElementById('results');

// Atualizar valor do range
savingsGoalInput.addEventListener('input', function() {
    savingsGoalValue.textContent = this.value + '%';
    calculateSavings();
});

// Calcular economia quando inputs mudarem
incomeInput.addEventListener('input', calculateSavings);
expensesInput.addEventListener('input', calculateSavings);

function calculateSavings() {
    const income = parseFloat(incomeInput.value) || 0;
    const expenses = parseFloat(expensesInput.value) || 0;
    const savingsGoal = parseFloat(savingsGoalInput.value) || 0;

    // Só mostrar resultados se houver valores
    if (income === 0 && expenses === 0) {
        resultsDiv.style.display = 'none';
        return;
    }

    resultsDiv.style.display = 'block';

    // Cálculos
    const actualSavings = income - expenses;
    const recommendedSavings = (income * savingsGoal) / 100;
    const monthsToGoal = actualSavings > 0 ? Math.ceil((income * 6) / actualSavings) : 0;
    const isPositive = actualSavings > 0;
    const meetsGoal = actualSavings >= recommendedSavings;

    // Atualizar valores
    document.getElementById('actualSavings').textContent =
        'R$ ' + actualSavings.toFixed(2).replace('.', ',');
    document.getElementById('recommendedSavings').textContent =
        'R$ ' + recommendedSavings.toFixed(2).replace('.', ',');
    document.getElementById('monthsToGoal').textContent =
        (isPositive && actualSavings > 0) ? monthsToGoal + ' meses' : '- meses';

    // Atualizar cores do card de economia real
    const actualSavingsCard = document.querySelector('.result-card.actual-savings');
    if (isPositive) {
        actualSavingsCard.classList.remove('negative');
    } else {
        actualSavingsCard.classList.add('negative');
    }

    // Atualizar mensagem
    const resultMessage = document.getElementById('resultMessage');
    if (meetsGoal && isPositive) {
        resultMessage.className = 'result-message success';
        resultMessage.textContent = '✅ Parabéns! Você está atingindo sua meta de economia mensal.';
    } else {
        resultMessage.className = 'result-message warning';
        resultMessage.textContent = '⚠️ Você está abaixo da sua meta. Considere reduzir despesas ou aumentar sua renda.';
    }
}

// Efeito de hover nos cards
document.querySelectorAll('.video-card, .blog-card, .resource-card').forEach(card => {
    card.addEventListener('click', function() {
        console.log('Card clicado:', this);
    });
});

// Animação de scroll suave (opcional)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

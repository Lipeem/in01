const STORAGE_KEY = 'nutriTrackRecords';
const API_KEY_STORAGE = 'nutriTrackApiKey';

const mealForm = document.getElementById('mealForm');
const weightForm = document.getElementById('weightForm');
const waterForm = document.getElementById('waterForm');
const recordsTable = document.getElementById('recordsTable');
const statsContainer = document.getElementById('stats');
const analysisResult = document.getElementById('analysisResult');
const apiKeyInput = document.getElementById('apiKey');

const analyzeButton = document.getElementById('analyzeButton');
const mealPhotoInput = document.getElementById('mealPhoto');
const manualCaloriesInput = document.getElementById('manualCalories');

const dailyCalories = document.getElementById('dailyCalories');
const weeklyCalories = document.getElementById('weeklyCalories');
const monthlyCalories = document.getElementById('monthlyCalories');
const weightProgress = document.getElementById('weightProgress');

let records = loadRecords();
apiKeyInput.value = localStorage.getItem(API_KEY_STORAGE) || '';
setDefaultDates();
renderAll();

apiKeyInput.addEventListener('change', () => {
    localStorage.setItem(API_KEY_STORAGE, apiKeyInput.value.trim());
});

analyzeButton.addEventListener('click', analyzeMealPhoto);
mealForm.addEventListener('submit', handleMealSubmit);
weightForm.addEventListener('submit', handleWeightSubmit);
waterForm.addEventListener('submit', handleWaterSubmit);
recordsTable.addEventListener('click', handleDelete);

function setDefaultDates() {
    const now = new Date();
    const local = now.toISOString().slice(0, 16);
    document.getElementById('mealDate').value = local;
    document.getElementById('weightDate').value = local;
    document.getElementById('waterDate').value = local;
}

function loadRecords() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveRecords() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

async function analyzeMealPhoto() {
    const file = mealPhotoInput.files[0];
    const apiKey = apiKeyInput.value.trim();

    if (!file) {
        analysisResult.textContent = 'Selecione uma foto antes de analisar.';
        return;
    }
    if (!apiKey) {
        analysisResult.textContent = 'Informe a API key para usar análise por IA.';
        return;
    }

    analysisResult.textContent = 'Analisando imagem com IA...';

    try {
        const base64 = await toBase64(file);
        const response = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4.1-mini',
                input: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'input_text',
                                text: 'Analise a refeição na imagem e responda APENAS com um número inteiro representando calorias estimadas totais.',
                            },
                            {
                                type: 'input_image',
                                image_url: base64,
                            },
                        ],
                    },
                ],
            }),
        });

        if (!response.ok) {
            throw new Error('Falha ao chamar API de IA.');
        }

        const data = await response.json();
        const rawText = data.output_text || '';
        const calories = Number((rawText.match(/\d+/) || [])[0]);

        if (!calories) {
            throw new Error('A IA não retornou calorias válidas.');
        }

        manualCaloriesInput.value = calories;
        analysisResult.textContent = `Estimativa de calorias: ${calories} kcal`;
    } catch (error) {
        analysisResult.textContent = `Erro: ${error.message}`;
    }
}

function handleMealSubmit(event) {
    event.preventDefault();

    const date = document.getElementById('mealDate').value;
    const calories = Number(manualCaloriesInput.value);

    if (!date || !calories) {
        analysisResult.textContent = 'Informe data e calorias (manual ou via IA).';
        return;
    }

    records.push({
        id: crypto.randomUUID(),
        datetime: new Date(date).toISOString(),
        type: 'meal',
        calories,
        weightKg: null,
        waterMl: null,
        note: mealPhotoInput.files[0] ? `Foto: ${mealPhotoInput.files[0].name}` : 'Inserção manual',
    });

    mealForm.reset();
    setDefaultDates();
    analysisResult.textContent = 'Refeição salva com sucesso.';
    persistAndRender();
}

function handleWeightSubmit(event) {
    event.preventDefault();

    const date = document.getElementById('weightDate').value;
    const weight = Number(document.getElementById('weightValue').value);

    if (!date || !weight) {
        return;
    }

    records.push({
        id: crypto.randomUUID(),
        datetime: new Date(date).toISOString(),
        type: 'weight',
        calories: null,
        weightKg: weight,
        waterMl: null,
        note: 'Registro de peso',
    });

    weightForm.reset();
    setDefaultDates();
    persistAndRender();
}

function handleWaterSubmit(event) {
    event.preventDefault();

    const date = document.getElementById('waterDate').value;
    const water = Number(document.getElementById('waterAmount').value);

    if (!date || !water) {
        return;
    }

    records.push({
        id: crypto.randomUUID(),
        datetime: new Date(date).toISOString(),
        type: 'water',
        calories: null,
        weightKg: null,
        waterMl: water,
        note: 'Registro de água',
    });

    waterForm.reset();
    setDefaultDates();
    persistAndRender();
}

function handleDelete(event) {
    if (!event.target.classList.contains('delete-btn')) {
        return;
    }
    const id = event.target.dataset.id;
    records = records.filter((record) => record.id !== id);
    persistAndRender();
}

function persistAndRender() {
    records.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
    saveRecords();
    renderAll();
}

function renderAll() {
    renderTable();
    renderStats();
    renderReports();
}

function renderTable() {
    recordsTable.innerHTML = '';

    for (const record of records) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDateTime(record.datetime)}</td>
            <td>${labelType(record.type)}</td>
            <td>${record.calories ?? '-'}</td>
            <td>${record.weightKg ?? '-'}</td>
            <td>${record.waterMl ?? '-'}</td>
            <td>${record.note || '-'}</td>
            <td><button class="delete-btn" data-id="${record.id}">Excluir</button></td>
        `;
        recordsTable.appendChild(tr);
    }
}

function renderStats() {
    const meals = records.filter((record) => record.type === 'meal');
    const weights = records.filter((record) => record.type === 'weight');
    const waters = records.filter((record) => record.type === 'water');

    const totalCalories = meals.reduce((sum, item) => sum + (item.calories || 0), 0);
    const totalWater = waters.reduce((sum, item) => sum + (item.waterMl || 0), 0);

    const latestWeight = weights.length ? weights.slice().sort((a, b) => new Date(b.datetime) - new Date(a.datetime))[0].weightKg : null;

    statsContainer.innerHTML = `
        <div class="stat-box"><span>Registros totais</span><strong>${records.length}</strong></div>
        <div class="stat-box"><span>Calorias totais</span><strong>${totalCalories} kcal</strong></div>
        <div class="stat-box"><span>Água total</span><strong>${totalWater} ml</strong></div>
        <div class="stat-box"><span>Último peso</span><strong>${latestWeight ? `${latestWeight} kg` : '-'}</strong></div>
    `;
}

function renderReports() {
    renderBars(dailyCalories, aggregateCaloriesByPeriod('day', 7));
    renderBars(weeklyCalories, aggregateCaloriesByPeriod('week', 8));
    renderBars(monthlyCalories, aggregateCaloriesByPeriod('month', 6));
    renderBars(weightProgress, weightSeries(8), 'kg');
}

function aggregateCaloriesByPeriod(period, count) {
    const meals = records.filter((record) => record.type === 'meal');
    const grouped = new Map();

    for (const meal of meals) {
        const date = new Date(meal.datetime);
        const key = periodKey(date, period);
        grouped.set(key, (grouped.get(key) || 0) + meal.calories);
    }

    return buildRecentLabels(period, count).map((label) => ({
        label,
        value: grouped.get(label) || 0,
    }));
}

function weightSeries(limit) {
    const points = records
        .filter((record) => record.type === 'weight')
        .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
        .slice(-limit)
        .map((record) => ({
            label: shortDate(record.datetime),
            value: record.weightKg,
        }));

    return points.length ? points : [{ label: 'Sem dados', value: 0 }];
}

function renderBars(container, data, unit = 'kcal') {
    container.innerHTML = '';
    const max = Math.max(...data.map((item) => item.value), 1);

    data.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'bar-row';
        row.innerHTML = `
            <span>${item.label}</span>
            <div class="bar"><div class="bar-fill" style="width: ${(item.value / max) * 100}%"></div></div>
            <strong>${Math.round(item.value)}${unit === 'kg' ? '' : ''} ${unit}</strong>
        `;
        container.appendChild(row);
    });
}

function periodKey(date, period) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    if (period === 'day') {
        return `${year}-${month}-${day}`;
    }

    if (period === 'month') {
        return `${year}-${month}`;
    }

    const week = getWeekNumber(date);
    return `${year}-W${String(week).padStart(2, '0')}`;
}

function buildRecentLabels(period, count) {
    const labels = [];
    const now = new Date();

    for (let i = count - 1; i >= 0; i--) {
        const date = new Date(now);
        if (period === 'day') {
            date.setDate(now.getDate() - i);
        } else if (period === 'month') {
            date.setMonth(now.getMonth() - i);
        } else {
            date.setDate(now.getDate() - i * 7);
        }
        labels.push(periodKey(date, period));
    }

    return labels;
}

function getWeekNumber(date) {
    const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = temp.getUTCDay() || 7;
    temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
    return Math.ceil((((temp - yearStart) / 86400000) + 1) / 7);
}

function formatDateTime(iso) {
    return new Date(iso).toLocaleString('pt-BR');
}

function shortDate(iso) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function labelType(type) {
    return {
        meal: 'Refeição',
        weight: 'Peso',
        water: 'Água',
    }[type] || type;
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('views'));

let words = [];
let selectedWords = {};
let undercover = "";

// 读取 words.json 文件
fs.readFile('words.json', 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading the file:", err);
        return;
    }

    words = JSON.parse(data);
});

app.get('/start', (req, res) => {
    const players = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve'];
    undercover = players[Math.floor(Math.random() * players.length)]; // 随机选择一个卧底
    const randomIndex = Math.floor(Math.random() * words.length);
    selectedWords = words[randomIndex];

    console.log("Undercover is:", undercover);
    console.log("Selected words are:", selectedWords);

    res.json(selectedWords);
});

app.post('/chat', async (req, res) => {
    const playerName = req.body.playerName;

    // 游戏的基本上下文
    const gameContext = "在场5个人中4个人拿到相同的一个词语，剩下的1个拿到与之相关的另一个词语。每人每轮只能说一句话描述自己拿到的词语（不能直接说出那个词语），既不能让卧底发现，也要给同伴以暗示。";

    // 根据玩家名字和是否是卧底生成提示
    const playerRole = playerName === undercover ? `你是卧底，你的词是 '${selectedWords.undercover}'。请描述你的词，但不要直接说出来。` : `你是平民，你的词是 '${selectedWords.common}'。请描述你的词，但不要直接说出来。`;

    const prompt = `${gameContext} ${playerRole}`;

    // 打印提示词
    console.log(`Prompt for ${playerName}: ${prompt}`);

    // 调用 ChatGPT API
    const OPENAI_API_KEY = '';
    const response = await axios.post('https://api.openai.com/v1/engines/davinci/completions', {
        prompt: prompt,
        max_tokens: 50,
    }, {
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
    });

    const reply = response.data.choices[0].text.trim();
    console.log(`${playerName} said: ${reply}`);
    res.json({ reply });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});
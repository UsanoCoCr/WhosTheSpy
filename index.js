const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');
const OPENAI_API_KEY = '';

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

let chatHistory = []; // 用于存储每个玩家的描述

app.post('/chat', async (req, res) => {
    const playerName = req.body.playerName;

    // 游戏的基本上下文
    const gameContext = "在场5个人中4个人拿到相同的一个词语，剩下的1个拿到与之相关的另一个词语。每人每轮只能说一句话描述自己拿到的词语（不能直接说出那个词语），既不能让卧底发现，也要给同伴以暗示。";

    // 根据玩家名字和是否是卧底生成提示
    const playerRole = playerName === undercover ? `你是卧底，你的词是 '${selectedWords.undercover}'。` : `你是平民，你的词是 '${selectedWords.common}'。`;

    const messages = [
        { role: "system", content: gameContext },
        ...chatHistory.map(chat => ({ role: "user", content: chat.content })), // 使用"user"作为role
        { role: "user", content: playerRole + "请描述你的词，但不要直接说出来。" }
    ];

    // 打印提示词
    console.log(`Prompt for ${playerName}: ${playerRole}`);

    // 调用 ChatGPT API
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-3.5-turbo",
        messages: messages
    }, {
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
    });

    const reply = response.data.choices[0].message.content.trim();
    console.log(`${playerName} said: ${reply}`);

    // 将玩家的描述添加到聊天记录中
    chatHistory.push({ content: `${playerName}: ${reply}` });

    res.json({ reply });
});

let votes = {}; // 用于存储每个玩家的票数

app.post('/vote', async (req, res) => {
    const playerName = req.body.playerName;

    // 清空上一轮的投票结果
    if (!votes[playerName]) {
        votes = {
            'Alice': 0,
            'Bob': 0,
            'Carol': 0,
            'Dave': 0,
            'Eve': 0
        };
    }

    const prompt = `你是${playerName}，在场的玩家有Alice, Bob, Carol, Dave, Eve。请投票选择你认为是卧底的玩家。`;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "你正在玩谁是卧底游戏。" },
            { role: "user", content: prompt }
        ]
    }, {
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
    });

    const vote = response.data.choices[0].message.content.trim();
    for (let player of ['Alice', 'Bob', 'Carol', 'Dave', 'Eve']) {
        if (vote.includes(player)) {
            votes[player]++;
        }
    }

    console.log(`${playerName} voted for: ${vote}`);
    res.json({ vote });
});

app.get('/getVotes', (req, res) => {
    res.json(votes);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});
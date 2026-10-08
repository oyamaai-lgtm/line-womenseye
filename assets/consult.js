// ライフキャリア相談AI（サンプル）
// 本物のAIではなく、あらかじめ用意した返答で会話の流れを再現しています。

const log = document.getElementById('log');
const form = document.getElementById('form');
const input = document.getElementById('input');
const mic = document.getElementById('mic');

const TOPICS = {
  work: {
    label: '💼 仕事・キャリア',
    keywords: ['仕事', '就職', '転職', '働', 'パート', '面接', 'キャリア', '職場'],
    reply: 'お仕事のこと、考えているんですね。\nたとえば「どんな仕事が向いているかわからない」「ブランクが不安」など、いま気になっていることを教えてもらえますか？\n\n先輩たちがどんな道を進んだかは <a href="stories.html">先輩と各期の学び</a> で見られます。じっくり話したいときは、キャリアコンサルタントへの相談もご案内できます。',
    next: ['human', 'learn'],
  },
  learn: {
    label: '📚 学び・資格',
    keywords: ['資格', '勉強', '学', 'Udemy', '講座', '試験', '続かな'],
    reply: '学びを続けたい気持ち、すてきです。\n忙しい時期は、1日5分でも大丈夫ですよ。\n\n資格をめざすならUdemyを無料で使え、合格すれば受験料のサポートもあります。<a href="points.html">資格サポート・ポイント</a> をのぞいてみてください。仲間と一緒なら <a href="events.html#circle">学び合いサークル</a> もあります。',
    next: ['work', 'human'],
  },
  family: {
    label: '🏠 家族・子育て・介護',
    keywords: ['家族', '子育て', '子ども', '子供', '夫', '介護', '親', '家庭'],
    reply: 'ご家族のこと、ひとりで抱えていると大変ですよね。話してくれてありがとうございます。\n\nよければ、いちばん困っていることを教えてください。内容に合わせて、地域の相談窓口や専門の機関もご案内します。\n※サンプルでは、案内先は後で設定する想定です。',
    next: ['feeling', 'human'],
  },
  feeling: {
    label: '🌧 気持ちがしんどい',
    keywords: ['つらい', '辛い', 'しんどい', '疲れ', '不安', '眠れ', '悲し', '苦し'],
    reply: 'しんどい気持ちを教えてくれて、ありがとうございます。\nいまは無理に前を向かなくても大丈夫です。\n\n人と話したいときは、相談チームのスタッフにつなぐこともできます。\n命や安全にかかわる緊急のときは、すぐに110番・119番に連絡してください。',
    next: ['human'],
  },
  human: {
    label: '🙋 人に相談したい',
    keywords: ['人と', 'スタッフ', '相談員', '予約', '直接', '対面'],
    reply: 'キャリアコンサルタントの資格を持つ相談員と、オンラインまたは対面で話せます。\nこのページ下の「相談を予約する」から申し込めます（サンプルでは予約できません）。\n\n相談内容を見られるのは、ライフキャリア相談チームだけなので安心してください。',
    next: [],
  },
};

function addMessage(who, content, { html = false } = {}) {
  const el = document.createElement('div');
  el.className = `msg ${who}`;
  if (html) el.innerHTML = content;
  else el.textContent = content;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
  return el;
}

function addChips(keys) {
  if (!keys.length) return;
  const wrap = document.createElement('div');
  wrap.className = 'chips';
  keys.forEach(key => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = TOPICS[key].label;
    b.addEventListener('click', () => {
      wrap.remove();
      addMessage('me', TOPICS[key].label);
      respond(key);
    });
    wrap.appendChild(b);
  });
  log.appendChild(wrap);
  log.scrollTop = log.scrollHeight;
}

function respond(key) {
  const typing = addMessage('ai', '入力中…');
  typing.classList.add('typing');
  setTimeout(() => {
    typing.remove();
    if (key) {
      addMessage('ai', TOPICS[key].reply, { html: true });
      addChips(TOPICS[key].next);
    } else {
      addMessage('ai', '話してくれてありがとうございます。\nもう少しくわしく聞かせてもらえますか？ 近いものがあれば選んでください。');
      addChips(['work', 'learn', 'family', 'feeling']);
    }
  }, 900);
}

function detectTopic(text) {
  return Object.keys(TOPICS).find(key => TOPICS[key].keywords.some(w => text.includes(w)));
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  log.querySelectorAll('.chips').forEach(c => c.remove());
  addMessage('me', text);
  respond(detectTopic(text));
});

// 音声入力（ブラウザが対応している場合のみ）
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (Recognition) {
  const rec = new Recognition();
  rec.lang = 'ja-JP';
  rec.interimResults = true;
  rec.onresult = e => {
    input.value = Array.from(e.results).map(r => r[0].transcript).join('');
  };
  rec.onend = () => {
    mic.classList.remove('listening');
    if (input.value.trim()) form.requestSubmit();
  };
  mic.addEventListener('click', () => {
    if (mic.classList.contains('listening')) return rec.stop();
    input.value = '';
    mic.classList.add('listening');
    rec.start();
  });
} else {
  mic.addEventListener('click', () => {
    alert('このブラウザは音声入力に対応していません。本番では音声で自然に話せるようにする想定です。');
  });
}

// 最初のあいさつ
addMessage('ai', 'こんにちは。ライフキャリア相談AIです🌷\nお仕事のこと、学びのこと、ご家族のことなど、なんでも話してください。\n\nここでの相談は、ほかの修了生にはわかりません。');
addChips(['work', 'learn', 'family', 'feeling', 'human']);

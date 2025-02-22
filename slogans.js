const slogans = {
  sale: [
      "Flash sale on Bitcoin!\nDon't miss out! 🛍️",
      "Panic sellers are your\nbest friends! 📢",
      "Buy low, HODL high! 🤑",
      "Bitcoin on sale!\nGet it while it lasts! 🛒",
      "Cheap sats for the taking! 🏷️",
      "Stack sats, stay humble! 🙌",
      "Buy the dip,\nthank me later! 🤝",
      "Sats on sale!\nGrab them now! 🛒",
      "Bitcoin discount!\nDon't miss the opportunity! 💸",
      "The market is bleeding,\ntime to buy! 🩸",
      "Discounted Bitcoin!\nBuy the dip! 📉",
      "HODLers are feasting today! 💰",
      "Bitcoin sale!\nLoad up your wallet! 💼",
      "Sats for sale!\nGet them cheap! 🛒",
      "Bitcoin: Because who needs\nstability? 😂",
      "Bitcoin: The rollercoaster of\nemotions! 🎢"
  ],
  hodl: [
      "Bitcoin doesn’t flinch,\nneither should you! 🛡️",
      "One Bitcoin is still\none Bitcoin! 📈",
      "HODLing is a superpower! 💎",
      "Stay calm and HODL on! 🧘",
      "Bitcoin is the future.\nHODL it! 🚀",
      "HODLers never lose! 💪",
      "Bitcoin is digital gold.\nHODL it! 🏆",
      "HODL the line! 🛡️",
      "HODL strong,\nBitcoin is here to stay! 🛡️",
      "Bitcoin is a game changer.\nHODL it! 🎮",
      "HODL tight,\nthe future is bright! 🌟",
      "Bitcoin is unstoppable.\nHODL it! 🚀",
      "HODLers are the real winners! 🏆",
      "Bitcoin is the new gold.\nHODL it! 🏅",
      "HODLers never sell! 💪",
      "Bitcoin is the future of money.\nHODL it! 💰",
      "HODLers are the true believers! 🙌",
      "Bitcoin is the ultimate store of\nvalue. HODL it! 💎",
      "Bitcoin is the future of finance.\nHODL it! 💸",
      "HODLers are the real heroes! 🦸",
      "Bitcoin is the future of wealth.\nHODL it! 💰",
      "HODLers are the real\nvisionaries! 👁️",
      "Bitcoin is the future of freedom.\nHODL it! 🗽",
      "HODLers are the real champions! 🏆",
      "HODL: Because selling is for quitters! 😎",
      "HODL: The ultimate test of patience! ⏳",
      "HODL: The art of doing nothing! 🧘",
      "HODL: Because panic selling is overrated! 😅"
  ],
  moon: [
      "Buckle up,\nBitcoin is taking off! 🚀",
      "Moon mode activated! 🌕",
      "Bitcoin price isn't rising,\nfiat is just crashing! 📢",
      "Bitcoiners don’t sell,\nthey retire! 💰",
      "Bears in shambles,\nbulls dancing! 🔥",
      "Bitcoin to the moon! 🌙",
      "Bitcoin is unstoppable! 🚀",
      "Bitcoin is mooning! 🌕",
      "Bitcoin is a rocket ship! 🚀",
      "Bitcoin is a moonshot! 🌕",
      "Bitcoin is a game changer! 🎮",
      "Bitcoin is a revolution! ✊",
      "Bitcoin is the future! 🚀",
  ]
};

function getRandomSlogan(mode) {
  const messages = slogans[mode] || slogans.hodl;
  const slogan = messages[Math.floor(Math.random() * messages.length)];
  return slogan.replace(/\n/g, '<br>');
}

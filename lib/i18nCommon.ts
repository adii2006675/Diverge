// Translations shared by the chat page and the shared timeline page: moods, confidence, tags, and the shared page's own text.
// Order: Spanish, French, German, Japanese, Portuguese, Hindi, Chinese.
type Row = [string, string, string, string, string, string, string]
export const COMMON_ROWS: Record<string, Row> = {
  // World moods
  'Stable': ['Estable', 'Stable', 'Stabil', '安定', 'Estável', 'स्थिर', '稳定'],
  'Tense': ['Tenso', 'Tendu', 'Angespannt', '緊迫', 'Tenso', 'तनावपूर्ण', '紧张'],
  'Critical': ['Crítico', 'Critique', 'Kritisch', '危機的', 'Crítico', 'गंभीर', '危急'],
  'At war': ['En guerra', 'En guerre', 'Im Krieg', '戦争中', 'Em guerra', 'युद्ध में', '战争中'],
  'Catastrophic': ['Catastrófico', 'Catastrophique', 'Katastrophal', '壊滅的', 'Catastrófico', 'विनाशकारी', '灾难性'],
  'Rebuilding': ['Reconstruyendo', 'En reconstruction', 'Im Wiederaufbau', '再建中', 'Reconstruindo', 'पुनर्निर्माण', '重建中'],
  'Flourishing': ['Próspero', 'Florissant', 'Aufblühend', '繁栄', 'Próspero', 'समृद्ध', '繁荣'],
  // Confidence and fact kinds
  'High confidence': ['Confianza alta', 'Confiance élevée', 'Hohe Zuversicht', '信頼度: 高', 'Confiança alta', 'उच्च विश्वास', '高可信度'],
  'Medium confidence': ['Confianza media', 'Confiance moyenne', 'Mittlere Zuversicht', '信頼度: 中', 'Confiança média', 'मध्यम विश्वास', '中等可信度'],
  'Low confidence': ['Confianza baja', 'Confiance faible', 'Geringe Zuversicht', '信頼度: 低', 'Confiança baixa', 'कम विश्वास', '低可信度'],
  'Documented': ['Documentado', 'Documenté', 'Belegt', '記録あり', 'Documentado', 'प्रलेखित', '有记录'],
  'Inference': ['Inferencia', 'Déduction', 'Schlussfolgerung', '推論', 'Inferência', 'अनुमान', '推断'],
  'Speculation': ['Especulación', 'Spéculation', 'Spekulation', '推測', 'Especulação', 'अटकल', '推测'],
  // Tags
  'Starts {n}': ['Empieza en {n}', 'Commence en {n}', 'Beginnt {n}', '{n}年から', 'Começa em {n}', '{n} से शुरू', '起于 {n}'],
  'Now {n}': ['Ahora {n}', 'Maintenant {n}', 'Jetzt {n}', '現在 {n}', 'Agora {n}', 'अब {n}', '现在 {n}'],
  '{n} what-if': ['{n} hipótesis', '{n} hypothèse', '{n} Was-wäre-wenn', '「もしも」{n}件', '{n} hipótese', '{n} "क्या होता अगर"', '{n} 个假设'],
  '{n} what-ifs': ['{n} hipótesis', '{n} hypothèses', '{n} Was-wäre-wenn', '「もしも」{n}件', '{n} hipóteses', '{n} "क्या होता अगर"', '{n} 个假设'],
  'Question': ['Pregunta', 'Question', 'Frage', '質問', 'Pergunta', 'प्रश्न', '问题'],
  'Sources:': ['Fuentes:', 'Sources :', 'Quellen:', '出典:', 'Fontes:', 'स्रोत:', '来源：'],
  'source': ['fuente', 'source', 'Quelle', '出典', 'fonte', 'स्रोत', '来源'],
  'Portfolio': ['Portafolio', 'Portfolio', 'Portfolio', 'ポートフォリオ', 'Portfólio', 'पोर्टफोलियो', '作品集'],
  'Back to Diverge': ['Volver a Diverge', 'Retour à Diverge', 'Zurück zu Diverge', 'Diverge に戻る', 'Voltar ao Diverge', 'Diverge पर वापस', '返回 Diverge'],
  // Shared timeline page
  'This timeline isn’t available': ['Esta línea de tiempo no está disponible', 'Cette chronologie n’est pas disponible', 'Diese Zeitlinie ist nicht verfügbar', 'このタイムラインは利用できません', 'Esta linha do tempo não está disponível', 'यह समयरेखा उपलब्ध नहीं है', '此时间线不可用'],
  'The link may be wrong, or its owner stopped sharing it.': ['Puede que el enlace sea incorrecto o que su dueño haya dejado de compartirlo.', 'Le lien est peut-être incorrect, ou son propriétaire a arrêté de le partager.', 'Der Link ist vielleicht falsch, oder der Besitzer teilt ihn nicht mehr.', 'リンクが間違っているか、作成者が共有を停止した可能性があります。', 'O link pode estar errado ou o dono parou de compartilhá-lo.', 'लिंक गलत हो सकता है, या इसके मालिक ने साझा करना बंद कर दिया है।', '链接可能有误，或者其所有者已停止分享。'],
  'Couldn’t load this timeline': ['No se pudo cargar esta línea de tiempo', 'Impossible de charger cette chronologie', 'Diese Zeitlinie konnte nicht geladen werden', 'このタイムラインを読み込めませんでした', 'Não foi possível carregar esta linha do tempo', 'यह समयरेखा लोड नहीं हो सकी', '无法加载此时间线'],
  'Check your connection and try again.': ['Revisa tu conexión e inténtalo de nuevo.', 'Vérifiez votre connexion et réessayez.', 'Prüfe deine Verbindung und versuche es erneut.', '接続を確認してもう一度お試しください。', 'Verifique sua conexão e tente novamente.', 'अपना कनेक्शन जाँचें और फिर कोशिश करें।', '请检查网络连接后重试。'],
  'Try again': ['Reintentar', 'Réessayer', 'Erneut versuchen', 'もう一度試す', 'Tentar novamente', 'फिर कोशिश करें', '重试'],
  'Shared alternate timeline': ['Línea de tiempo alternativa compartida', 'Chronologie alternative partagée', 'Geteilte alternative Zeitlinie', '共有されたもう一つの歴史', 'Linha do tempo alternativa compartilhada', 'साझा की गई वैकल्पिक समयरेखा', '分享的另一条时间线'],
  'Written by an AI as alternate history. Treat it as informed speculation, not fact.': ['Escrito por una IA como historia alternativa. Tómalo como especulación fundamentada, no como un hecho.', 'Écrit par une IA comme histoire alternative. À prendre comme une spéculation éclairée, pas comme un fait.', 'Von einer KI als alternative Geschichte geschrieben. Betrachte es als fundierte Spekulation, nicht als Tatsache.', 'AIが書いたもう一つの歴史です。事実ではなく、根拠のある推測として受け止めてください。', 'Escrito por uma IA como história alternativa. Trate como especulação fundamentada, não como fato.', 'AI द्वारा वैकल्पिक इतिहास के रूप में लिखा गया। इसे तथ्य नहीं, सोच-समझकर लगाया गया अनुमान मानें।', '由 AI 撰写的另类历史。请将其视为有依据的推测，而非事实。'],
  'Start your own timeline': ['Empieza tu propia línea de tiempo', 'Créez votre propre chronologie', 'Starte deine eigene Zeitlinie', '自分のタイムラインを始める', 'Comece sua própria linha do tempo', 'अपनी खुद की समयरेखा शुरू करें', '开始你自己的时间线'],
}

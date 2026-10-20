// Interface translations. English text is the key, so components keep reading naturally: t('Explore').
// A missing entry falls back to the English text. Each entry lists: Spanish, French, German, Japanese, Portuguese, Hindi, Chinese.
// Historical content (event data) and the AI's answers are not here: answers are written in the chosen language by the API.

export const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Portuguese', 'Hindi', 'Chinese'] as const
export type Language = (typeof LANGUAGES)[number]

// Language names are always shown in their own language so anyone can find theirs.
export const NATIVE_NAMES: Record<Language, string> = {
  English: 'English', Spanish: 'Español', French: 'Français', German: 'Deutsch',
  Japanese: '日本語', Portuguese: 'Português', Hindi: 'हिन्दी', Chinese: '中文',
}
export const LOCALES: Record<Language, string> = {
  English: 'en-US', Spanish: 'es', French: 'fr', German: 'de', Japanese: 'ja', Portuguese: 'pt', Hindi: 'hi', Chinese: 'zh-CN',
}

const ORDER: Language[] = ['Spanish', 'French', 'German', 'Japanese', 'Portuguese', 'Hindi', 'Chinese']

type Row = [string, string, string, string, string, string, string]
const RAW: Record<string, Row> = {
  // Navigation
  'Explore': ['Explorar', 'Explorer', 'Entdecken', '探索', 'Explorar', 'खोजें', '探索'],
  'About': ['Acerca de', 'À propos', 'Über uns', '概要', 'Sobre', 'परिचय', '关于'],
  'Sessions': ['Sesiones', 'Sessions', 'Sitzungen', 'セッション', 'Sessões', 'सत्र', '会话'],
  'Sign In': ['Iniciar sesión', 'Se connecter', 'Anmelden', 'ログイン', 'Entrar', 'साइन इन', '登录'],
  'Sign Out': ['Cerrar sesión', 'Se déconnecter', 'Abmelden', 'ログアウト', 'Sair', 'साइन आउट', '退出登录'],
  'Profile': ['Perfil', 'Profil', 'Profil', 'プロフィール', 'Perfil', 'प्रोफ़ाइल', '个人资料'],
  'Settings': ['Ajustes', 'Paramètres', 'Einstellungen', '設定', 'Configurações', 'सेटिंग्स', '设置'],
  'User': ['Usuario', 'Utilisateur', 'Nutzer', 'ユーザー', 'Usuário', 'उपयोगकर्ता', '用户'],
  'Home': ['Inicio', 'Accueil', 'Startseite', 'ホーム', 'Início', 'होम', '首页'],

  // Profile page
  'Changes save automatically to your account.': ['Los cambios se guardan automáticamente en tu cuenta.', 'Les modifications sont enregistrées automatiquement sur votre compte.', 'Änderungen werden automatisch in deinem Konto gespeichert.', '変更は自動的にアカウントに保存されます。', 'As alterações são salvas automaticamente na sua conta.', 'बदलाव आपके खाते में अपने आप सहेजे जाते हैं।', '更改会自动保存到你的账户。'],
  'Click your name to change it': ['Haz clic en tu nombre para cambiarlo', 'Cliquez sur votre nom pour le modifier', 'Klicke auf deinen Namen, um ihn zu ändern', '名前をクリックして変更', 'Clique no seu nome para alterá-lo', 'नाम बदलने के लिए उस पर क्लिक करें', '点击你的名字即可修改'],
  'Click to change your name': ['Haz clic para cambiar tu nombre', 'Cliquez pour modifier votre nom', 'Klicken, um deinen Namen zu ändern', 'クリックして名前を変更', 'Clique para alterar seu nome', 'नाम बदलने के लिए क्लिक करें', '点击修改名字'],
  'Saved': ['Guardado', 'Enregistré', 'Gespeichert', '保存しました', 'Salvo', 'सहेजा गया', '已保存'],
  'Couldn’t save that name. Try again.': ['No se pudo guardar ese nombre. Inténtalo de nuevo.', 'Impossible d’enregistrer ce nom. Réessayez.', 'Der Name konnte nicht gespeichert werden. Versuche es erneut.', '名前を保存できませんでした。もう一度お試しください。', 'Não foi possível salvar o nome. Tente novamente.', 'नाम सहेजा नहीं जा सका। फिर कोशिश करें।', '无法保存该名字，请重试。'],
  'Account': ['Cuenta', 'Compte', 'Konto', 'アカウント', 'Conta', 'खाता', '账户'],
  'Email': ['Correo electrónico', 'E-mail', 'E-Mail', 'メールアドレス', 'E-mail', 'ईमेल', '邮箱'],
  'Email cannot be changed.': ['El correo no se puede cambiar.', 'L’e-mail ne peut pas être modifié.', 'Die E-Mail kann nicht geändert werden.', 'メールアドレスは変更できません。', 'O e-mail não pode ser alterado.', 'ईमेल बदला नहीं जा सकता।', '邮箱无法更改。'],
  'Member since': ['Miembro desde', 'Membre depuis', 'Mitglied seit', '登録日', 'Membro desde', 'सदस्यता की तारीख', '注册时间'],
  'Change Password': ['Cambiar contraseña', 'Changer le mot de passe', 'Passwort ändern', 'パスワードを変更', 'Alterar senha', 'पासवर्ड बदलें', '修改密码'],
  'Minimum requirements': ['Requisitos mínimos', 'Exigences minimales', 'Mindestanforderungen', '最低要件', 'Requisitos mínimos', 'न्यूनतम आवश्यकताएँ', '最低要求'],
  '8-16 characters': ['8-16 caracteres', '8 à 16 caractères', '8–16 Zeichen', '8〜16文字', '8 a 16 caracteres', '8-16 अक्षर', '8-16 个字符'],
  '1 uppercase': ['1 mayúscula', '1 majuscule', '1 Großbuchstabe', '大文字1つ', '1 maiúscula', '1 बड़ा अक्षर', '1 个大写字母'],
  '1 lowercase': ['1 minúscula', '1 minuscule', '1 Kleinbuchstabe', '小文字1つ', '1 minúscula', '1 छोटा अक्षर', '1 个小写字母'],
  '1 number': ['1 número', '1 chiffre', '1 Zahl', '数字1つ', '1 número', '1 अंक', '1 个数字'],
  '1 special character': ['1 carácter especial', '1 caractère spécial', '1 Sonderzeichen', '記号1つ', '1 caractere especial', '1 विशेष वर्ण', '1 个特殊字符'],
  'New password': ['Nueva contraseña', 'Nouveau mot de passe', 'Neues Passwort', '新しいパスワード', 'Nova senha', 'नया पासवर्ड', '新密码'],
  'Confirm new password': ['Confirmar nueva contraseña', 'Confirmer le nouveau mot de passe', 'Neues Passwort bestätigen', '新しいパスワード（確認）', 'Confirmar nova senha', 'नया पासवर्ड दोहराएँ', '确认新密码'],
  'Update Password': ['Actualizar contraseña', 'Mettre à jour le mot de passe', 'Passwort aktualisieren', 'パスワードを更新', 'Atualizar senha', 'पासवर्ड अपडेट करें', '更新密码'],
  'Updating...': ['Actualizando...', 'Mise à jour...', 'Wird aktualisiert...', '更新中...', 'Atualizando...', 'अपडेट हो रहा है...', '更新中...'],
  'Password Updated ✓': ['Contraseña actualizada ✓', 'Mot de passe mis à jour ✓', 'Passwort aktualisiert ✓', 'パスワードを更新しました ✓', 'Senha atualizada ✓', 'पासवर्ड अपडेट हो गया ✓', '密码已更新 ✓'],
  'Password must be 8-16 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character': ['La contraseña debe tener de 8 a 16 caracteres, con 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial', 'Le mot de passe doit contenir 8 à 16 caractères, dont 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial', 'Das Passwort muss 8–16 Zeichen lang sein und 1 Großbuchstaben, 1 Kleinbuchstaben, 1 Zahl und 1 Sonderzeichen enthalten', 'パスワードは8〜16文字で、大文字・小文字・数字・記号をそれぞれ1つ以上含めてください', 'A senha deve ter de 8 a 16 caracteres, com 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial', 'पासवर्ड 8-16 अक्षरों का हो, जिसमें 1 बड़ा अक्षर, 1 छोटा अक्षर, 1 अंक और 1 विशेष वर्ण हो', '密码需为 8-16 个字符，且包含大写字母、小写字母、数字和特殊字符各 1 个'],
  'Passwords do not match': ['Las contraseñas no coinciden', 'Les mots de passe ne correspondent pas', 'Die Passwörter stimmen nicht überein', 'パスワードが一致しません', 'As senhas não coincidem', 'पासवर्ड मेल नहीं खाते', '两次输入的密码不一致'],

  // Settings sections
  'Theme': ['Tema', 'Thème', 'Design', 'テーマ', 'Tema', 'थीम', '主题'],
  'Light': ['Claro', 'Clair', 'Hell', 'ライト', 'Claro', 'लाइट', '浅色'],
  'Dark': ['Oscuro', 'Sombre', 'Dunkel', 'ダーク', 'Escuro', 'डार्क', '深色'],
  'Accent Color': ['Color de acento', 'Couleur d’accent', 'Akzentfarbe', 'アクセントカラー', 'Cor de destaque', 'एक्सेंट रंग', '强调色'],
  'None': ['Ninguno', 'Aucune', 'Keine', 'なし', 'Nenhuma', 'कोई नहीं', '无'],
  'Red': ['Rojo', 'Rouge', 'Rot', '赤', 'Vermelho', 'लाल', '红色'],
  'Orange': ['Naranja', 'Orange', 'Orange', 'オレンジ', 'Laranja', 'नारंगी', '橙色'],
  'Blue': ['Azul', 'Bleu', 'Blau', '青', 'Azul', 'नीला', '蓝色'],
  'Green': ['Verde', 'Vert', 'Grün', '緑', 'Verde', 'हरा', '绿色'],
  'Purple': ['Morado', 'Violet', 'Lila', '紫', 'Roxo', 'बैंगनी', '紫色'],
  'Pink': ['Rosa', 'Rose', 'Pink', 'ピンク', 'Rosa', 'गुलाबी', '粉色'],
  'Brown': ['Marrón', 'Marron', 'Braun', '茶色', 'Marrom', 'भूरा', '棕色'],
  'Font Size': ['Tamaño de letra', 'Taille de police', 'Schriftgröße', '文字サイズ', 'Tamanho da fonte', 'फ़ॉन्ट आकार', '字号'],
  'Small': ['Pequeño', 'Petit', 'Klein', '小', 'Pequeno', 'छोटा', '小'],
  'Medium': ['Mediano', 'Moyen', 'Mittel', '中', 'Médio', 'मध्यम', '中'],
  'Large': ['Grande', 'Grand', 'Groß', '大', 'Grande', 'बड़ा', '大'],
  'Language': ['Idioma', 'Langue', 'Sprache', '言語', 'Idioma', 'भाषा', '语言'],
  'Display Options': ['Opciones de visualización', 'Options d’affichage', 'Anzeigeoptionen', '表示オプション', 'Opções de exibição', 'डिस्प्ले विकल्प', '显示选项'],
  'Show confidence level': ['Mostrar nivel de confianza', 'Afficher le niveau de confiance', 'Konfidenzniveau anzeigen', '信頼度を表示', 'Mostrar nível de confiança', 'विश्वास स्तर दिखाएँ', '显示置信度'],
  'Display LOW / MEDIUM / HIGH confidence badge on AI responses': ['Muestra una insignia de confianza BAJA / MEDIA / ALTA en las respuestas de la IA', 'Affiche un badge de confiance FAIBLE / MOYEN / ÉLEVÉ sur les réponses de l’IA', 'Zeigt bei KI-Antworten ein Badge für NIEDRIGE / MITTLERE / HOHE Konfidenz an', 'AIの回答に信頼度（低・中・高）のバッジを表示します', 'Exibe um selo de confiança BAIXA / MÉDIA / ALTA nas respostas da IA', 'AI के उत्तरों पर कम / मध्यम / उच्च विश्वास का बैज दिखाएँ', '在 AI 回答上显示低 / 中 / 高置信度标记'],

  // AI response settings
  'AI Responses': ['Respuestas de la IA', 'Réponses de l’IA', 'KI-Antworten', 'AIの回答', 'Respostas da IA', 'AI के उत्तर', 'AI 回答'],
  'Response length': ['Longitud de la respuesta', 'Longueur de la réponse', 'Antwortlänge', '回答の長さ', 'Tamanho da resposta', 'उत्तर की लंबाई', '回答长度'],
  'Short': ['Corta', 'Courte', 'Kurz', '短め', 'Curta', 'छोटा', '简短'],
  'Long': ['Larga', 'Longue', 'Lang', '長め', 'Longa', 'लंबा', '详细'],
  '1 to 2 sentences and 3 key facts': ['1 o 2 frases y 3 datos clave', '1 à 2 phrases et 3 faits clés', '1 bis 2 Sätze und 3 Kernfakten', '1〜2文とキーファクト3つ', '1 a 2 frases e 3 fatos-chave', '1-2 वाक्य और 3 मुख्य तथ्य', '1 到 2 句话和 3 个关键事实'],
  'One paragraph and 5 key facts': ['Un párrafo y 5 datos clave', 'Un paragraphe et 5 faits clés', 'Ein Absatz und 5 Kernfakten', '1段落とキーファクト5つ', 'Um parágrafo e 5 fatos-chave', 'एक अनुच्छेद और 5 मुख्य तथ्य', '一段文字和 5 个关键事实'],
  '2 to 3 paragraphs and 10 key facts': ['2 o 3 párrafos y 10 datos clave', '2 à 3 paragraphes et 10 faits clés', '2 bis 3 Absätze und 10 Kernfakten', '2〜3段落とキーファクト10個', '2 a 3 parágrafos e 10 fatos-chave', '2-3 अनुच्छेद और 10 मुख्य तथ्य', '两到三段文字和 10 个关键事实'],
  'Depth': ['Profundidad', 'Niveau de détail', 'Tiefe', '深さ', 'Profundidade', 'गहराई', '深度'],
  'Simple': ['Sencilla', 'Simple', 'Einfach', 'やさしい', 'Simples', 'सरल', '通俗'],
  'In-depth': ['A fondo', 'Approfondie', 'Ausführlich', '詳しい', 'Aprofundada', 'विस्तृत', '深入'],
  'Plain, friendly language, like a person explaining it to a friend': ['Lenguaje claro y cercano, como si se lo explicaras a un amigo', 'Un langage simple et amical, comme si on l’expliquait à un ami', 'Einfache, freundliche Sprache, wie bei einer Erklärung an einen Freund', '友達に説明するような、平易で親しみやすい言葉', 'Linguagem simples e amigável, como explicar a um amigo', 'दोस्त को समझाने जैसी सरल, मित्रवत भाषा', '像对朋友解释一样，简单友好的语言'],
  'Named institutions and people, chains of cause and effect, competing views': ['Instituciones y personas con nombre, cadenas de causa y efecto, puntos de vista contrapuestos', 'Institutions et personnes nommées, chaînes de causes et d’effets, points de vue divergents', 'Benannte Institutionen und Personen, Ursache-Wirkungs-Ketten, konkurrierende Sichtweisen', '具体的な機関や人物、因果の連鎖、対立する見方', 'Instituições e pessoas nomeadas, cadeias de causa e efeito, visões divergentes', 'नामित संस्थाएँ और व्यक्ति, कारण-प्रभाव की श्रृंखला, विभिन्न मत', '具体的机构与人物、因果链条、不同观点'],
  'Plausibility': ['Plausibilidad', 'Plausibilité', 'Plausibilität', 'もっともらしさ', 'Plausibilidade', 'संभाव्यता', '合理程度'],
  'Realistic': ['Realista', 'Réaliste', 'Realistisch', '現実的', 'Realista', 'यथार्थवादी', '写实'],
  'Speculative': ['Especulativa', 'Spéculative', 'Spekulativ', '大胆な推測', 'Especulativa', 'काल्पनिक', '大胆推测'],
  'Stay with the most likely outcomes': ['Mantente en los resultados más probables', 'Rester sur les issues les plus probables', 'Bei den wahrscheinlichsten Ergebnissen bleiben', '最も起こりそうな結果にとどめる', 'Ficar nos resultados mais prováveis', 'सबसे संभावित परिणामों पर टिके रहें', '只讨论最可能的结果'],
  'Explore bolder but still grounded possibilities': ['Explora posibilidades más audaces pero con fundamento', 'Explorer des possibilités plus audacieuses mais fondées', 'Mutigere, aber weiterhin fundierte Möglichkeiten erkunden', '大胆でも根拠のある可能性を探る', 'Explorar possibilidades mais ousadas, mas fundamentadas', 'अधिक साहसी लेकिन आधार वाली संभावनाएँ खोजें', '探索更大胆但仍有依据的可能性'],
  'Tone': ['Tono', 'Ton', 'Ton', 'トーン', 'Tom', 'लहजा', '语气'],
  'Neutral historian': ['Historiador neutral', 'Historien neutre', 'Neutraler Historiker', '中立的な歴史家', 'Historiador neutro', 'तटस्थ इतिहासकार', '中立的历史学家'],
  'Dramatic narrator': ['Narrador dramático', 'Narrateur dramatique', 'Dramatischer Erzähler', 'ドラマチックな語り手', 'Narrador dramático', 'नाटकीय कथावाचक', '戏剧化的叙述者'],
  'Academic': ['Académico', 'Académique', 'Akademisch', '学術的', 'Acadêmico', 'अकादमिक', '学术'],
  'Balanced, factual, measured': ['Equilibrado, objetivo, mesurado', 'Équilibré, factuel, mesuré', 'Ausgewogen, sachlich, besonnen', 'バランスが取れていて、事実に基づき、落ち着いた', 'Equilibrado, factual, comedido', 'संतुलित, तथ्यपरक, संयमित', '平衡、客观、克制'],
  'Vivid, cinematic storytelling': ['Narración vívida y cinematográfica', 'Récit vivant et cinématographique', 'Lebendiges, filmisches Erzählen', '鮮やかで映画のような語り', 'Narrativa vívida e cinematográfica', 'जीवंत, सिनेमाई कथा-शैली', '生动、电影感的叙事'],
  'Formal, citation-minded, precise': ['Formal, atento a las citas, preciso', 'Formel, soucieux des sources, précis', 'Formell, quellenbewusst, präzise', '格式ばった、出典を意識した正確な文体', 'Formal, atento às citações, preciso', 'औपचारिक, संदर्भ-केंद्रित, सटीक', '正式、注重引用、精确'],

  // API key
  'Your API key': ['Tu clave de API', 'Votre clé API', 'Dein API-Schlüssel', 'あなたのAPIキー', 'Sua chave de API', 'आपकी API कुंजी', '你的 API 密钥'],
  'Each account gets 2 free questions. After that, add your own Anthropic API key to keep going. It is kept only in this browser, sent with your own requests, and never stored on the server. Answers still use Diverge’s own instructions.': ['Cada cuenta tiene 2 preguntas gratis. Después, añade tu propia clave de API de Anthropic para continuar. Solo se guarda en este navegador, se envía con tus propias solicitudes y nunca se almacena en el servidor. Las respuestas siguen usando las instrucciones propias de Diverge.', 'Chaque compte dispose de 2 questions gratuites. Ensuite, ajoutez votre propre clé API Anthropic pour continuer. Elle reste uniquement dans ce navigateur, est envoyée avec vos propres requêtes et n’est jamais stockée sur le serveur. Les réponses suivent toujours les instructions propres à Diverge.', 'Jedes Konto hat 2 kostenlose Fragen. Danach füge deinen eigenen Anthropic-API-Schlüssel hinzu, um weiterzumachen. Er bleibt nur in diesem Browser, wird mit deinen eigenen Anfragen gesendet und nie auf dem Server gespeichert. Die Antworten folgen weiterhin den eigenen Anweisungen von Diverge.', '各アカウントには無料の質問が2回あります。その後は、ご自身のAnthropic APIキーを追加すると続けられます。キーはこのブラウザ内にのみ保存され、あなたのリクエストと一緒に送信され、サーバーには保存されません。回答は引き続きDivergeの指示に従います。', 'Cada conta tem 2 perguntas grátis. Depois, adicione sua própria chave de API da Anthropic para continuar. Ela fica apenas neste navegador, é enviada com as suas próprias solicitações e nunca é armazenada no servidor. As respostas continuam seguindo as instruções do Diverge.', 'हर खाते को 2 मुफ़्त प्रश्न मिलते हैं। उसके बाद जारी रखने के लिए अपनी Anthropic API कुंजी जोड़ें। यह केवल इसी ब्राउज़र में रहती है, आपके अपने अनुरोधों के साथ भेजी जाती है और सर्वर पर कभी सहेजी नहीं जाती। उत्तर अब भी Diverge के अपने निर्देशों का पालन करते हैं।', '每个账户有 2 次免费提问。之后请添加你自己的 Anthropic API 密钥以继续使用。密钥仅保存在此浏览器中，随你自己的请求发送，绝不会存储在服务器上。回答仍然遵循 Diverge 自己的指令。'],
  'Your key is saved.': ['Tu clave está guardada.', 'Votre clé est enregistrée.', 'Dein Schlüssel ist gespeichert.', 'キーを保存しました。', 'Sua chave foi salva.', 'आपकी कुंजी सहेजी गई है।', '你的密钥已保存。'],
  'Remove': ['Quitar', 'Supprimer', 'Entfernen', '削除', 'Remover', 'हटाएँ', '移除'],
  'Save key': ['Guardar clave', 'Enregistrer la clé', 'Schlüssel speichern', 'キーを保存', 'Salvar chave', 'कुंजी सहेजें', '保存密钥'],
  'Saved in this browser.': ['Guardada en este navegador.', 'Enregistrée dans ce navigateur.', 'In diesem Browser gespeichert.', 'このブラウザに保存しました。', 'Salva neste navegador.', 'इस ब्राउज़र में सहेजी गई।', '已保存在此浏览器中。'],
  'Removed.': ['Eliminada.', 'Supprimée.', 'Entfernt.', '削除しました。', 'Removida.', 'हटा दी गई।', '已移除。'],
  'That doesn’t look like an Anthropic key (it starts with sk-ant-).': ['Eso no parece una clave de Anthropic (empieza por sk-ant-).', 'Cela ne ressemble pas à une clé Anthropic (elle commence par sk-ant-).', 'Das sieht nicht nach einem Anthropic-Schlüssel aus (er beginnt mit sk-ant-).', 'Anthropicのキーではないようです（sk-ant- で始まります）。', 'Isso não parece uma chave da Anthropic (ela começa com sk-ant-).', 'यह Anthropic कुंजी जैसी नहीं लगती (यह sk-ant- से शुरू होती है)।', '这看起来不是 Anthropic 密钥（应以 sk-ant- 开头）。'],
  'Anthropic API key': ['Clave de API de Anthropic', 'Clé API Anthropic', 'Anthropic-API-Schlüssel', 'Anthropic APIキー', 'Chave de API da Anthropic', 'Anthropic API कुंजी', 'Anthropic API 密钥'],
}

const DICT: Record<Language, Record<string, string>> = {
  English: {}, Spanish: {}, French: {}, German: {}, Japanese: {}, Portuguese: {}, Hindi: {}, Chinese: {},
}
for (const [en, row] of Object.entries(RAW)) ORDER.forEach((lang, i) => { DICT[lang][en] = row[i] })

export function normalizeLanguage(value: unknown): Language {
  return (LANGUAGES as readonly string[]).includes(value as string) ? (value as Language) : 'English'
}

export function translate(language: unknown, text: string): string {
  return DICT[normalizeLanguage(language)][text] ?? text
}

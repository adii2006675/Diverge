import LegalView from '@/components/LegalView'

export const metadata = { title: 'Privacy · Diverge' }

const sections: { title: string; body: string[] }[] = [
  {
    title: 'What we keep',
    body: [
      'If you make an account: your email, the name and age you enter, your profile picture, your display settings, the timelines you save, and how many of your 2 free questions you have used.',
      'If you use Diverge without an account, your settings are kept only in your browser.',
    ],
  },
  {
    title: 'Questions and answers',
    body: [
      'Each what-if you ask is sent to Anthropic, which writes the answer. Before that, the server runs a short web search through Anthropic and looks up the event on Wikipedia to ground the answer. The event name and your question are used as the search text, and the sources it used are shown under the answer.',
      'Questions you ask are only stored if you are signed in and the timeline is saved to your account.',
    ],
  },
  {
    title: 'Your own API key',
    body: [
      'If you add your own Anthropic key, it stays in your browser and is sent with your own requests only. Diverge does not store it on the server.',
    ],
  },
  {
    title: 'Share links',
    body: [
      'When you press Share, a frozen copy of that timeline is stored and anyone who has the link can read it. It does not include your email, name or account details. You can stop sharing from the message that appears right after you create the link, and the link stops working.',
    ],
  },
  {
    title: 'Services we rely on',
    body: [
      'Supabase stores accounts and saved data and sends sign-in emails. Anthropic generates answers and runs the web searches. Vercel hosts the site. Wikipedia and other public web pages supply reference text.',
    ],
  },
  {
    title: 'Deleting your data',
    body: [
      'You can delete saved timelines yourself from the Sessions page. To remove your account and everything attached to it, contact the person who runs this site.',
    ],
  },
]

export default function PrivacyPage() {
  return <LegalView title="Privacy" intro="Diverge is a small project. This page says in plain words what it stores and who sees it." sections={sections} />
}

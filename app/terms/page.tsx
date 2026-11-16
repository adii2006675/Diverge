import LegalView from '@/components/LegalView'

export const metadata = { title: 'Terms · Diverge' }

const sections: { title: string; body: string[] }[] = [
  {
    title: 'What Diverge is',
    body: [
      'Diverge is a small creative project. You pick a historical event, ask a what-if question, and an AI writes a possible alternate history. It is made for curiosity and learning.',
    ],
  },
  {
    title: 'Answers are not facts',
    body: [
      'Everything about the alternate world is the AI imagining what might have happened. It can be wrong, and the divergence score is an estimate, not a measurement. The real-history facts shown come from public sources and can contain mistakes. Check anything important yourself.',
    ],
  },
  {
    title: 'Using the site',
    body: [
      'Be kind and use it for lawful purposes. Do not try to break the site, overload it, or use it to produce content that targets or harms real people. Accounts get a limited number of free questions; after that you can add your own Anthropic API key.',
    ],
  },
  {
    title: 'Your content',
    body: [
      'The questions you ask and the timelines you save are yours. If you press Share, anyone with the link can read that timeline until you stop sharing it.',
    ],
  },
  {
    title: 'No guarantees',
    body: [
      'Diverge is provided as it is, with no promise that it will always be available or free of errors. It may change or shut down at any time. To the extent the law allows, the person who runs the site is not liable for losses from using it.',
    ],
  },
  {
    title: 'Questions',
    body: [
      'See the Privacy page for how data is handled. For anything else, contact the person who runs this site from the About page.',
    ],
  },
]

export default function TermsPage() {
  return <LegalView title="Terms" intro="The short version of the rules for using Diverge." sections={sections} />
}

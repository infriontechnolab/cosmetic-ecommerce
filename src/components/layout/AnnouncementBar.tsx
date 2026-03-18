import { getAnnouncements } from '@/lib/api'

export default async function AnnouncementBar() {
  const announcements = await getAnnouncements()
  // Duplicate for seamless marquee loop
  const messages = [...announcements, ...announcements]

  return (
    <div className="bg-void-2 border-b border-border overflow-hidden py-[9px]">
      <div
        className="flex items-center gap-12 whitespace-nowrap w-max"
        style={{ animation: 'marquee 28s linear infinite' }}
      >
        {messages.map((msg, i) => (
          <span key={i} className="flex items-center gap-3 text-[12px] font-medium text-chalk-2">
            <span className="text-acid text-[8px]">◆</span>
            {msg.highlight
              ? <><span>{msg.text}</span><strong className="text-acid font-bold">{msg.highlight}</strong></>
              : msg.text
            }
          </span>
        ))}
      </div>
    </div>
  )
}

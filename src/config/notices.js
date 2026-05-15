export const getNotices = (t) => [
  {
    title: t('System Upgrade Announcement'),
    content: t('Considering the queue cycle of the MS financial project across multiple markets and its impact on team income and motivation, it has been decided to comprehensively upgrade the MS system. The upgraded MS 2.0 system will fully resolve the impact of queue cycles on earnings, while team rewards will also be comprehensively optimized.')
  },
  {
    title: t('Queue Adjustment Notice'),
    content: t('For investors who have already joined the queue or have already entered the financial program under the original system, the queue control coefficient will be adjusted from the date of this announcement. Interest for users who have already entered the earning stage will continue to be calculated normally, and additional compensation will be provided after the upgrade.')
  },
  {
    title: t('Upgrade Timeline'),
    content: t('The upgrade is expected to be fully completed within two to three weeks from the date of this announcement. During the upgrade period, all financial interest earnings will continue to be calculated normally. Partners who are still in the queue on the upgrade date may simply set up a fund migration.')
  },
  {
    title: t('Security Assurance'),
    content: t('During this system upgrade, there will be no risk of asset loss for any investors or team funds. Please do not worry.')
  }
]

export const getNoticeTexts = (t) => getNotices(t).map(notice => notice.content)

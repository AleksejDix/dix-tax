/**
 * Today, as one shared value.
 *
 * `useState` puts it in the payload, so the server, the first client render and every
 * component that asks agree on it and nothing moves when the page hydrates. A prerendered
 * page carries the date of the build until the script runs and replaces it with the real one.
 * That correction is safe because no layout depends on it: `upcomingDeadlines` always returns
 * one row per filing, whatever day it is asked about, so only the dates themselves change.
 */
export function useToday() {
  const today = useState<Date>('today', () => new Date())

  onMounted(() => {
    today.value = new Date()
  })

  return today
}

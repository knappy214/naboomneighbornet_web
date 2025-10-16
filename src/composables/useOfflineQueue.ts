/**
Time Discussion Channels
 */
stamp: Date
maxRetries: number
QueueState {
  isOnline: boolean
  queuedMessages: QueuedMessage[]
OfflineQueueState>({
    isOnline: navigator.onLine,
    queuedMessages: [],
      re.result
        resolve(db)
      }
    })
  }

   */
  const loadQueuedMessages = async (): Promise<void> => {
    if (!db) {

    return new Promi{
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = db.transaction([storeName], 'readonly')
st = store.getAll()

      request.onsuccess = () => {
        state.value.queuedMessages = request.result || []
        resolve()
c (message: QueuedMessage): Promise<void> => {
    if (!db) {

    rise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'))
eName], 'readwrite')
      const store = transaction.objectStore(storeName)
ess = () => {
        resolve()
      }

 save message'))
      }
    })
  }

  /**
   * Delete message from IndexedDB
ge = async (messageId: string): Promise<void> => {
    if (!db) {
      await initDB()
 (!db) {
    const transaction = db.transaction([storeName], 'readwrite')
lId: string, data: SendMessageForm): Promise<string> => {
now()}_${Math.random().toString(36).substr(2, 9)}`

,
      channelId,
      data,
'pending',
    }
      await saveMessage(queuedMessage)
      state.value.queuedMessages.push(queuedMessage)

t processQueue()
      }
      throw error

  /**
   * Process thel

dingMessages = state.value.queuedMessages.filter(
        (msg) => msg.status === 'pending' || msg.status === 'failed',
      )
          message.retryCount++
   * Send a  */
      ce } = await import('@/services/messageService')

      await messageService.sendMessage(message.channelId, message.data)
ait saveMessage(message)
      throw error

  /**
   * Retry failed messages
   */
  age)
    }

  }

  /**
       const transaction = db.transaction([storeName], 'readwrite')
        const store = transaction.objectStore(storeName)
    }
ilter((msg) => msg.channelId === channelId)

    * Handle online status change
   */
  const handleandle online status change
lue.isOnline && hasQueuedMessages.value) {
      await processQueue()
    }
  }

   */
  const getQueueStats = () => {
    const stats = {
/
  const getQueueStats = () => {
ges.length,
      pending: state.value.queuedMessages.filter((msg) => msg.status === 'pending').length,
      sending: state.value.queuedMessages.filter((msg) => msg.status === 'sending').length,
ges.filter((msg) => msg.status === 'failed').length,
      sent: state.value.queuedMessages.filter((msg) => msg.status === 'sent').length,
    }

    return stats
  }
   await loadQueuedMessages()

      // Set up online/offline event listeners
istener('online', handleOnlineStatusChange)
      window.addEventListener('offline', handleOnlineStatusChange)
isOnline) {
        await processQueue()
      }

      state.value.error = error.message || 'Failed to initialize offline queue'
entListener('offline', handleOnlineStatusChange)
  })

  return {
    error: computed(() => state.value.error),
    queu
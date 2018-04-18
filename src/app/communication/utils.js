// @flow
type Callback = () => void

/**
 * Subscribes for specific event and resolves when first event is received.
 *
 * @param subscriber - function to subscribe for specific event
 * @returns {Promise<any>}
 */
function waitForFirstEvent (subscriber: (Callback) => void): Promise<void> {
  return new Promise((resolve) => {
    subscriber(() => {
      resolve()
    })
  })
}

export { waitForFirstEvent }

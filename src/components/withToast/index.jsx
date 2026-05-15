import { Toast } from 'antd-mobile'

export const withToast = async (asyncFn, options = {}) => {
  const {
    t,
    loadingText = 'loading',
    successText = 'success',
    errorText = 'failed',
  } = options

  const toast = Toast.show({
    icon: 'loading',
    maskClickable: false,
    content: t(loadingText),
  })

  try {
    const result = await asyncFn()

    toast.close()
    Toast.show({
      icon: 'success',
      content: t(successText),
    })

    return result
  } catch (error) {
    console.error(error)

    toast.close()
    Toast.show({
      icon: 'fail',
      content: t(errorText),
    })

    throw error
  }
}
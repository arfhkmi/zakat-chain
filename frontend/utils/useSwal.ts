import Swal from 'sweetalert2'

/**
 * Custom SweetAlert2 utility for Zakat Chain
 * Matches the dark theme and glassmorphism aesthetic of the app
 */

const baseConfig = {
  background: 'oklch(0.19 0 0)', // Matching --card color
  color: 'oklch(0.985 0 0)',      // Matching --foreground color
  confirmButtonColor: 'oklch(0.72 0.22 150)', // Matching --primary color
  borderRadius: '1rem',
  customClass: {
    popup: 'rounded-2xl border border-white/5 backdrop-blur-xl',
    confirmButton: 'px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95',
    cancelButton: 'px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95'
  }
}

const Toast = Swal.mixin({
  ...baseConfig,
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})

export const useSwal = () => {
  /**
   * Display a success toast or alert
   */
  const handleSuccess = (title: string, text?: string, isToast = true) => {
    if (isToast) {
      return Toast.fire({
        icon: 'success',
        title,
        text,
        iconColor: 'oklch(0.72 0.22 150)',
      })
    }
    return Swal.fire({
      ...baseConfig,
      icon: 'success',
      title,
      text,
      iconColor: 'oklch(0.72 0.22 150)',
    })
  }

  /**
   * Display an error alert or toast
   */
  const handleError = (error: any, title: string = 'Error', isToast = false) => {
    const message = typeof error === 'string' ? error : error?.message || 'Something went wrong'
    console.error('Swal Error:', error)
    
    if (isToast) {
      return Toast.fire({
        icon: 'error',
        title: title === 'Error' ? message : title,
        text: title === 'Error' ? undefined : message,
        iconColor: 'oklch(0.627 0.258 23.5)',
      })
    }

    return Swal.fire({
      ...baseConfig,
      icon: 'error',
      title: title,
      text: message,
      iconColor: 'oklch(0.627 0.258 23.5)', // Matching --error color
    })
  }

  /**
   * Display a loading alert that cannot be dismissed by clicking outside
   */
  const handleLoading = (title: string = 'Processing...', text: string = 'Please wait while we process your transaction') => {
    return Swal.fire({
      ...baseConfig,
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })
  }

  /**
   * Close any active SweetAlert
   */
  const close = () => {
    Swal.close()
  }

  return {
    handleSuccess,
    handleError,
    handleLoading,
    close,
    Swal,
    Toast
  }
}

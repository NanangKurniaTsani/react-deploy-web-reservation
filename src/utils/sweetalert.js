import Swal from "sweetalert2"

// Custom SweetAlert configurations
export const showSuccessAlert = (title, text, timer = 3000) => {
  return Swal.fire({
    icon: "success",
    title: title,
    text: text,
    confirmButtonColor: "#3b82f6",
    timer: timer,
    showConfirmButton: timer ? false : true,
    toast: true,
    position: "top-end",
    showCloseButton: true,
    timerProgressBar: true,
  })
}

export const showErrorAlert = (title, text) => {
  return Swal.fire({
    icon: "error",
    title: title,
    text: text,
    confirmButtonColor: "#3b82f6",
    toast: true,
    position: "top-end",
    showCloseButton: true,
    timer: 5000,
    timerProgressBar: true,
  })
}

export const showWarningAlert = (title, text) => {
  return Swal.fire({
    icon: "warning",
    title: title,
    text: text,
    confirmButtonColor: "#3b82f6",
    toast: true,
    position: "top-end",
    showCloseButton: true,
    timer: 4000,
    timerProgressBar: true,
  })
}

export const showInfoAlert = (title, text) => {
  return Swal.fire({
    icon: "info",
    title: title,
    text: text,
    confirmButtonColor: "#3b82f6",
    toast: true,
    position: "top-end",
    showCloseButton: true,
    timer: 4000,
    timerProgressBar: true,
  })
}

export const showConfirmAlert = (title, text, confirmText = "Ya", cancelText = "Batal") => {
  return Swal.fire({
    title: title,
    text: text,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#6b7280",
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  })
}

export const showDeleteConfirmAlert = (title = "Hapus Data?", text = "Data yang dihapus tidak dapat dikembalikan!") => {
  return Swal.fire({
    title: title,
    text: text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
    reverseButtons: true,
  })
}

export const showLoadingAlert = (title = "Memproses...", text = "Mohon tunggu sebentar") => {
  return Swal.fire({
    title: title,
    text: text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })
}

export const closeLoadingAlert = () => {
  Swal.close()
}

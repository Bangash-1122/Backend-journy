import Swal from 'sweetalert2';

export async function confirmDelete({
  title = 'Are you sure?',
  text = 'This cannot be undone.',
  confirmButtonText = 'Delete',
} = {}) {
  const isDark = document.documentElement.classList.contains('dark');
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#FF0000',
    cancelButtonColor: '#606060',
    reverseButtons: true,
    background: isDark ? '#212121' : '#F9F9F9',
    color: isDark ? '#F1F1F1' : '#0F0F0F',
    customClass: {
      popup: 'rounded-2xl',
    },
  });
  return result.isConfirmed;
}

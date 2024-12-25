async function handleAvatarChange(event) {
    try {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);
        
        const response = await fetch('/profile/avatar', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            document.querySelector('.avatar-image').src = data.avatarUrl;
        } else {
            alert(data.message || 'Failed to update avatar');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating avatar');
    }
}

// async function handlePasswordUpdate(event) {
//     event.preventDefault();
    
//     const errorDiv = document.getElementById('passwordError');
//     const successDiv = document.getElementById('passwordSuccess');
    
//     try {
//         const currentPassword = document.getElementById('currentPassword').value;
//         const newPassword = document.getElementById('newPassword').value;
//         const confirmPassword = document.getElementById('confirmPassword').value;

//         if (newPassword !== confirmPassword) {
//             errorDiv.style.display = 'block';
//             errorDiv.textContent = 'New passwords do not match';
//             successDiv.style.display = 'none';
//             return;
//         }

//         const response = await fetch('/profile/password', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 currentPassword,
//                 newPassword
//             })
//         });

//         const data = await response.json();

//         if (data.success) {
//             successDiv.style.display = 'block';
//             successDiv.textContent = 'Password updated successfully';
//             errorDiv.style.display = 'none';
//             event.target.reset();
//         } else {
//             errorDiv.style.display = 'block';
//             errorDiv.textContent = data.message || 'Failed to update password';
//             successDiv.style.display = 'none';
//         }
//     } catch (error) {
//         errorDiv.style.display = 'block';
//         errorDiv.textContent = 'An error occurred during password update';
//         successDiv.style.display = 'none';
//         console.error('Error:', error);
//     }
// }
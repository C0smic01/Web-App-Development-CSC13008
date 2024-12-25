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
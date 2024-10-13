function validateInput(inputElement, errorMessage) {
    const value = inputElement.value.trim();
    const notification = document.getElementById('notification');
    if (value === '' || isNaN(value)) {
        notification.textContent = errorMessage;
        inputElement.focus();
        return false;
    }
    return true;
}

document.getElementById('num1').addEventListener('blur', function() {
    validateInput(this, 'Giá trị nhập ở ô Số thứ nhất không phải là số');
});

document.getElementById('num2').addEventListener('blur', function() {
    validateInput(this, 'Giá trị nhập ở ô Số thứ hai không phải là số');
});

function validateOperation() {
    const operation = document.querySelector('input[name="operation"]:checked');
    const notification = document.getElementById('notification');
    if (!operation) {
        notification.textContent = 'Vui lòng chọn một phép tính.';
        return false;
    }
    return true;
}

function calculate() {
    const num1Input = document.getElementById('num1');
    const num2Input = document.getElementById('num2');
    const notification = document.getElementById('notification');

    if (!validateInput(num1Input, 'Giá trị nhập ở ô Số thứ nhất không phải là số')) {
        notification.textContent = 'Vui lòng nhập hai số hợp lệ để thực hiện phép tính.';
        return;
    }
    if (!validateInput(num2Input, 'Giá trị nhập ở ô Số thứ hai không phải là số')) {
        notification.textContent = 'Vui lòng nhập hai số hợp lệ để thực hiện phép tính.';
        return;
    }
    if (!validateOperation()) {
        notification.textContent = 'Vui lòng chọn một phép tính.';
        return;
    }

    const num1 = parseFloat(num1Input.value);
    const num2 = parseFloat(num2Input.value);
    const operation = document.querySelector('input[name="operation"]:checked').value;

    let result = 0;

    switch (operation) {
        case 'add':
            result = num1 + num2;
            break;
        case 'subtract':
            result = num1 - num2;
            break;
        case 'multiply':
            result = num1 * num2;
            break;
        case 'divide':
            if (num2 === 0) {
                notification.textContent = 'Lỗi: Không thể chia cho 0.';
                return;
            }
            result = num1 / num2;
            break;
    }

    document.getElementById('result').value = result;
    notification.textContent = '';
}

document.getElementById('calculate-btn').addEventListener('click', calculate);
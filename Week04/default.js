function validateNum1() 
{
    const num1 = document.getElementById('num1').value;
    const errorDiv = document.getElementById('num1-error');
    if (isNaN(num1)) 
    {
        errorDiv.textContent = 'Số thứ nhất không phải là số';
        return false;
    }
    else if (num1.trim() === '') 
    {
        errorDiv.textContent = 'Số thứ nhất không được để trống';
        return false;
    }
    else {
        errorDiv.textContent = '';
        return true;
    }
}

function validateNum2() 
{
    const num2 = document.getElementById('num2').value;
    const errorDiv = document.getElementById('num2-error');
    if (isNaN(num2)) 
    {
        errorDiv.textContent = 'Số thứ hai không phải là số';
        return false;
    } 
    else if (num2.trim() === '') 
    {
        errorDiv.textContent = 'Số thứ hai không được để trống';
        return false;
    }
    else 
    {
        errorDiv.textContent = '';
        return true;
    }
}

function validateOperation() 
{
    const operation = document.querySelector('input[name="operation"]:checked');
    if (!operation) 
    {
        document.getElementById('notification').textContent = 'Vui lòng chọn một phép tính.';
        return false;
    } 
    else {
        document.getElementById('notification').textContent = '';
        return true;
    }
}

function calculate() {
    const isValidNum1 = validateNum1();
    const isValidNum2 = validateNum2();
    const isOperationSelected = validateOperation();
    let result = 0;

    if (!isValidNum1 || !isValidNum2 || !isOperationSelected) 
    {
        return;
    } 
    else 
    {
        document.getElementById('notification').textContent = '';
    }

    const num1 = parseFloat(document.getElementById('num1').value);
    const num2 = parseFloat(document.getElementById('num2').value);
    const operation = document.querySelector('input[name="operation"]:checked');

    switch (operation.value) 
    {
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
            if (num2 === 0) 
            {
                document.getElementById('notification').textContent = 'Không thể chia cho 0.';
                return;
            }
            result = num1 / num2;
            break;
    }

    document.getElementById('result').value = result;
}

document.getElementById('calculate-btn').addEventListener('click', function() 
{
    calculate();
});
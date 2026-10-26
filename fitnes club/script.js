document.addEventListener('DOMContentLoaded', () => {
    
    // === КАЛЬКУЛЯТОР ===
    const calcForm = document.getElementById('calcForm');
    if (calcForm) {
        const serviceSelect = document.getElementById('calcService');
        const countInput = document.getElementById('calcCount');
        const resultSpan = document.getElementById('calcResult');

        const calculate = () => {
            const price = parseInt(serviceSelect.value);
            const count = parseInt(countInput.value) || 0;
            resultSpan.textContent = price * count;
        };

        serviceSelect.addEventListener('change', calculate);
        countInput.addEventListener('input', calculate);
        calculate(); // Первичный расчет
    }

    // === ВАЛИДАЦИЯ И ОТПРАВКА ФОРМЫ ===
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let isValid = true;

            // Очистка ошибок
            document.querySelectorAll('.error').forEach(el => el.textContent = '');

            // Валидация ФИО (только кириллица и пробелы)
            const fullname = document.getElementById('fullname').value.trim();
            const nameRegex = /^[А-Яа-яЁё\s]+$/;
            if (!nameRegex.test(fullname)) {
                document.getElementById('err-fullname').textContent = 'Только кириллица и пробелы';
                isValid = false;
            }

            // Валидация телефона (+7(XXX)-XXX-XX-XX)
            const phone = document.getElementById('phone').value.trim();
            const phoneRegex = /^\+7\(\d{3}\)-\d{3}-\d{2}-\d{2}$/;
            if (!phoneRegex.test(phone)) {
                document.getElementById('err-phone').textContent = 'Формат: +7(XXX)-XXX-XX-XX';
                isValid = false;
            }

            // Валидация Email
            const email = document.getElementById('email').value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                document.getElementById('err-email').textContent = 'Некорректный email';
                isValid = false;
            }

            // Валидация Услуги
            const service = document.getElementById('service').value;
            if (!service) {
                document.getElementById('err-service').textContent = 'Выберите услугу';
                isValid = false;
            }

            // Валидация чекбокса
            const policy = document.getElementById('policy').checked;
            if (!policy) {
                document.getElementById('err-policy').textContent = 'Необходимо согласие';
                isValid = false;
            }

            // Если всё ок — отправляем на сервер
            if (isValid) {
                try {
                    const response = await fetch('/api/signup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            fullname: fullname,
                            phone: phone,
                            email: email,
                            service_id: parseInt(service)
                        })
                    });

                    const data = await response.json();
                    
                    if (data.success) {
                        document.getElementById('successMessage').style.display = 'block';
                        document.getElementById('successMessage').textContent = 'Вы успешно записаны! Мы свяжемся с вами.';
                        signupForm.reset();
                    } else {
                        alert('Ошибка: ' + data.error);
                    }
                } catch (err) {
                    alert('Ошибка соединения с сервером');
                }
            }
        });
    }
});

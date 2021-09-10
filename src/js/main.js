window.addEventListener('DOMContentLoaded', function () {

    const pauseBeforeStart = 500
    const timeSquaresAnimate = 500
    const pauaseBeforeRotate = 2000
    const pauseBeforeClick = 500

    let DATA = []

    const form = document.querySelector('.form')
    const squares = document.querySelector('.squares')
    const q1 = squares.querySelector('.squares__item_1')
    const q2 = squares.querySelector('.squares__item_2')
    const q3 = squares.querySelector('.squares__item_3')
    const q4 = squares.querySelector('.squares__item_4')
    const circle = squares.querySelector('.squares__circle')
    const selectMark = document.querySelector('#select_mark')
    const selectModel = document.querySelector('#select_model')
    const selectYear = document.querySelector('#select_year')
    const form__btn = form.querySelector('.form__btn')

    selectMark.addEventListener('change', setData)
    selectModel.addEventListener('change', setData)
    selectYear.addEventListener('change', setData)

    async function init() {
        circle.innerHTML = 'Нажать'
        circle.style.opacity = 0
        circle.style.transform = 'rotate(180deg)'
        squares.style.display = 'flex'
        q1.removeAttribute('style')
        q2.removeAttribute('style')
        q3.removeAttribute('style')
        q4.removeAttribute('style')
        form.style.display = 'none'
        form__btn.style.visibility = 'hidden'

        DATA = await getData()
        
        setData()
        
        setTimeout(async () => {
            circleAnimate()
            squaresAnimate()
        }, pauseBeforeStart)
    }
    init()


//set data
    function setData(e) {
        if (e && e.target === selectMark) {
            setModel()
            setYear()
        } else if (e && e.target === selectModel) {
            setYear()
        } else if (!e) {
            setMark()
            setModel()
            setYear()
        }
        setDate()
    }

    function setDate() {
        let date = DATA.filter((el) => el.mark === selectMark.value && el.model === selectModel.value && el.year === selectYear.value)

        if (date.length) {

            form__btn.innerHTML = ''
            date.forEach((el) => {
                const minMax = el.delivery.split('-')
                form__btn.insertAdjacentHTML('beforeend', `<button class="delivery" min="${minMax[0]}" max="${minMax[1]}">Доставить ${el.delivery}</button>`)
            })

            form__btn.style.visibility = 'visible'

            form__btn.querySelectorAll('.delivery').forEach((el) => {
                pickmeup(el, { 
                    min: el.getAttribute('min'),
                    max: el.getAttribute('max'),
                })

                el.addEventListener('pickmeup-change', function (e) {
                    finish(e.detail.formatted_date)
                    pickmeup(e.target).hide()
                })
            })

        } else {
            form__btn.style.visibility = 'hidden'
        }

    }

    function finish(date) {
        circle.innerHTML = `<div>Вы выбрали<br>${selectMark.value} ${selectModel.value},<br>доставка<br>${date}</div><br><button id="restart">Начать заново</button>`
        const restart = document.querySelector('#restart')
        restart.addEventListener('click', () => { init() })
        squares.style.display = 'flex'
        form.style.display = 'none'

    }

//set option
    function setMark() {
        const markData = getMarkData(DATA)
        selectMark.innerHTML = '<option value="">Выберите марку</option>' + markData
    }

    function setModel() {
        let modelData = DATA.filter((el) => el.mark === selectMark.value)
        modelData = getModelData(modelData)
        selectModel.innerHTML = '<option value="">Выберите модель</option>' + modelData
    }

    function setYear() {
        let yearData = DATA.filter((el) => el.mark === selectMark.value && el.model === selectModel.value)
        yearData = getYearData(yearData)
        selectYear.innerHTML = '<option value="">Выберите год</option>' + yearData
    }

//get data
    async function getData() {
        const res = await fetch('./resources/data.json')
        return await res.json()
    }

    function getMarkData(data) {
        const arr = []
        data.forEach((el) => {if (!arr.includes(el.mark)) {arr.push(el.mark)}})
        return arr.map((el) => (`<option value="${el}">${el}</option>`))
    }

    function getModelData(data) {
        const arr = []
        data.forEach((el) => { if (!arr.includes(el.model)) {arr.push(el.model)} })
        return arr.map((el) => (`<option value="${el}">${el}</option>`))
    }

    function getYearData(data) {
        const arr = []
        data.forEach((el) => { if (!arr.includes(el.year)) {arr.push(el.year)} })
        return arr.map((el) => (`<option value="${el}">${el}</option>`))
    }


//animation
    function circleAnimate() {
        setTimeout(() => {

            circle.style.opacity = 1
            

            setTimeout(() => {
                circle.style.transform = `rotate(0deg)`

                setTimeout(() => {
                    circle.addEventListener('click', startHandler)
                },pauseBeforeClick)
                
            }, pauaseBeforeRotate)
    
        }, timeSquaresAnimate)
    }
    function startHandler() {
        squares.style.display = `none`
        form.style.display = `flex`
        circle.removeEventListener('click', startHandler)
    }
    
    function squaresAnimate() {
        animate({
            timing(timeFraction) {
                return timeFraction;
            },
            draw(progress) {
                q1.style.top = `calc(${50 - (progress * 50)}% - 250px)`;
                q1.style.left = `calc(${50 - (progress * 50)}% - 250px)`;
                
                q2.style.top = `calc(${50 - (progress * 50)}% - 250px)`;
                q2.style.left = `calc(${50 + (progress * 50)}%)`;
    
                q3.style.top = `calc(${50 + (progress * 50)}%)`;
                q3.style.left = `calc(${50 - (progress * 50)}% - 250px)`;
    
                q4.style.top = `calc(${50 + (progress * 50)}%)`;
                q4.style.left = `calc(${50 + (progress * 50)}%)`;
            },
            duration: timeSquaresAnimate
        });
    }
    
    function animate({ timing, draw, duration }) {
        let start = performance.now();

        requestAnimationFrame(function animate(time) {
            // timeFraction изменяется от 0 до 1
            let timeFraction = (time - start) / duration;
            if (timeFraction > 1) timeFraction = 1;

            // вычисление текущего состояния анимации
            let progress = timing(timeFraction);

            draw(progress); // отрисовать её

            if (timeFraction < 1) {
                requestAnimationFrame(animate);
            }
        });
    }
});
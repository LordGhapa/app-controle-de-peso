let lineChart
let weights

const blocker = document.querySelector('#blocker')
const modal = document.querySelector('#modal')
const historyModal = document.querySelector('#historyModal')
const historyData = historyModal.querySelector('.historyData')

window.addEventListener('load', () => {
  manageLocalStore()
  updateLatestWeightIn()
  historyContent()
  historyDelActions()

  const ctx = document.querySelector('#chart')
  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          data: weights.weights,
          borderWidth: 3,
          borderColor: '#197bbd',
          pointStyle: true,
          cubicInterpolationMode: 'monotone'
        }
      ]
    },
    options: {
      parsing: {
        xAxisKey: 'day',
        yAxisKey: 'weight'
      },
      scales: {
        y: {
          border: {
            display: false
          }
        },
        x: {
          display: false
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          label: 'Weight',
          callbacks: {
            label: function (context) {
              let label
              if (context.parsed.y) {
                label = context.parsed.y + 'kg'
              }
              return label
            }
          }
        }
      }
    }
  })
})

const manageLocalStore = () => {
  weights = JSON.parse(localStorage.getItem('weights'))

  if (!weights) {
    localStorage.setItem('weights', JSON.stringify({ weights: [] }))
    weights = { weights: [] }
  }
}

const openModal = e => {
  blocker.style.display = 'block'
  modal.style.display = 'flex'

  anime({
    targets: modal,
    duration: 500,
    translateY: [50, 0],
    opacity: [0, 1],
    easing: 'easeOutElastic(2,.6)'
  })
}

const closeModal = e => {
  blocker.style.display = 'none'
  modal.style.display = 'none'
  historyModal.style.display = 'none'
}

const sendWeight = () => {
  const weightElement = document.querySelector('#weight')
  let weight = parseInt(weightElement.value)
  if (typeof weight !== 'number') {
    alert('Valor invalido ')
    return
  }

  const dayElement = document.querySelector('#day')
  let day = dayElement.value

  if (day === '' || weight === '') {
    return
  }

  const date = new Date(day)
  date.setDate(date.getDate() + 1)
  const currentDayFormated = date.toLocaleDateString('pt-BR')

  let found = false
  for (let i = 0; i < weights.weights.length; i++) {
    if (weights.weights[i].day === currentDayFormated) {
      weights.weights[i].weight = weight
      found = true
      break
    }
  }
  if (!found) {
    weights.weights.push({
      day: currentDayFormated,
      weight: weight
    })
  }

  weights?.weights.sort(function (a, b) {
    let dataA = new Date(convertDateFormat(a.day))
    let dataB = new Date(convertDateFormat(b.day))
    let diff = dataA - dataB
    return diff
  })

  if (weight) {
    localStorage.setItem('weights', JSON.stringify(weights))
  }

  weightElement.value = ''
  dayElement.value = ''
  closeModal()
  lineChart.update('reset')
  lineChart.update('show')
  updateLatestWeightIn()
  historyContent()
  historyDelActions()
}

const updateLatestWeightIn = () => {
  const latestDay = document.querySelector('#latest-day')
  const latestWeight = document.querySelector('#latest-weight')
  const latestWeightIn = weights.weights[weights.weights.length - 1]

  latestDay.innerHTML = latestWeightIn?.day ?? '-'
  latestWeight.innerHTML = latestWeightIn ? latestWeightIn.weight + 'kg' : '-'
}

function convertDateFormat(dateString) {
  const parts = dateString.split('/')
  const day = parts[0]
  const month = parts[1]
  const year = parts[2]
  const dateObj = new Date(`${month}/${day}/${year}`)
  const newDateString = `${
    dateObj.getMonth() + 1
  }/${dateObj.getDate()}/${dateObj.getFullYear()}`
  return newDateString
}

function historyContent() {
  let data = weights?.weights
    ? weights.weights.map((item, index) => {
        return `<li>
      <input type="text" disabled value="${item.day}"/>
      <input type="text" disabled value="${item.weight}" />
      <span id="${index}" class="material-symbols-outlined historyDel">delete_forever</span>
    </li>`
      })
    : ''

  if (data.length < 1) {
    data = ['<p>Nenhum Valor Registrado</p>']
  }
  historyData.innerHTML = data.join('')
}

document.querySelector('#btn').addEventListener('click', openModal)
document.querySelector('.historyClose').addEventListener('click', closeModal)
blocker.addEventListener('click', closeModal)
document.querySelector('#confirm').addEventListener('click', sendWeight)

document.querySelector('#history').addEventListener('click', () => {
  blocker.style.display = 'block'
  historyModal.style.display = 'flex'
  anime({
    targets: historyModal,
    duration: 500,
    translateY: [50, 0],
    opacity: [0, 1],
    easing: 'easeOutElastic(2,.6)'
  })
})

function historyDelActions() {
  document.querySelectorAll('.historyDel').forEach(item =>
    item.addEventListener('click', e => {
      // weights.weights.forEach(item => console.log('antes', item.weight))
      historyDelItem(e.target.id)
      anime({
        targets: e.target.parentElement,
        duration: 500,
        translateX: [0, 50],
        opacity: [1, 0],
        easing: 'easeInExpo',
        complete: function () {
          localStorage.setItem('weights', JSON.stringify(weights))
          lineChart.update('reset')
          lineChart.update('show')
          updateLatestWeightIn()
          historyContent()
          historyDelActions()
        }
      })
      // weights.weights.forEach(item => console.log('depois', item.weight))
    })
  )
}

function historyDelItem(index) {
  weights.weights.splice(index, 1)
}

let lineChart
/* let weights = {
  weights: [
    { day: '2023-04-01', weight: 150 },
    { day: '2023-04-02', weight: 148 },
    { day: '2023-04-03', weight: 149 },
    { day: '2023-04-04', weight: 147 },
    { day: '2023-04-05', weight: 146 },
    { day: '2023-04-06', weight: 145 },
    { day: '2023-04-07', weight: 144 },
    { day: '2023-04-08', weight: 142 },
    { day: '2023-04-09', weight: 141 },
    { day: '2023-04-10', weight: 140 },
    { day: '2023-04-11', weight: 138 },
    { day: '2023-04-12', weight: 137 },
    { day: '2023-04-13', weight: 136 },
    { day: '2023-04-14', weight: 135 },
    { day: '2023-04-15', weight: 134 },
    { day: '2023-04-16', weight: 132 },
    { day: '2023-04-17', weight: 131 },
    { day: '2023-04-18', weight: 130 },
    { day: '2023-04-19', weight: 129 },
    { day: '2023-04-20', weight: 128 }
  ]
} */
let weights

const blocker = document.querySelector('#blocker')
const modal = document.querySelector('#modal')

window.addEventListener('load', () => {
  manageLocalStore()
  updateLatestWeightIn()

  const ctx = document.querySelector('#chart')
  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          data: weights.weights,
          borderWidth: 3,
          borderColor: '#f49d37',
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
}

const sendWeight = () => {
  const weightElement = document.querySelector('#weight')
  let weight = parseInt(weightElement.value)

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
  closeModal()
  lineChart.update('reset')
  lineChart.update('show')
  updateLatestWeightIn()
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

document.querySelector('#btn').addEventListener('click', openModal)
blocker.addEventListener('click', closeModal)
document.querySelector('#confirm').addEventListener('click', sendWeight)

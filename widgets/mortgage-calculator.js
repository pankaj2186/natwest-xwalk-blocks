function monthlyRepayment(amount, ratePercent, years) {
  const monthlyRate = ratePercent / 100 / 12;
  const numPayments = years * 12;
  if (monthlyRate === 0) return amount / numPayments;
  return (amount * monthlyRate) / (1 - (1 + monthlyRate) ** -numPayments);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
}

export default function decorate(widget) {
  const form = widget.querySelector('.mortgage-calculator-form');
  const result = widget.querySelector('.mortgage-calculator-result');

  widget.querySelectorAll('.mortgage-calculator-stepper').forEach((stepper) => {
    const input = stepper.querySelector('input');
    stepper.querySelectorAll('.mortgage-calculator-stepper-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const step = parseFloat(btn.dataset.step);
        const next = Math.round((parseFloat(input.value || '0') + step) * 10) / 10;
        input.value = Math.max(parseFloat(input.min), Math.min(parseFloat(input.max), next));
      });
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const amount = parseFloat(data.get('amount'));
    const rate = parseFloat(data.get('rate'));
    const term = parseFloat(data.get('term'));
    const monthly = monthlyRepayment(amount, rate, term);
    const total = monthly * term * 12;
    result.innerHTML = `
      <p class="mortgage-calculator-result-label">Estimated monthly repayment</p>
      <p class="mortgage-calculator-result-value">${formatCurrency(monthly)}</p>
      <p class="mortgage-calculator-result-total">Total repaid over ${term} years: ${formatCurrency(total)}</p>
    `;
  });
}

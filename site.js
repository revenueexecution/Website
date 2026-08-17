document.addEventListener('DOMContentLoaded', () => {
  const year = new Date().getFullYear();
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = year);

  const buttons = [...document.querySelectorAll('[data-solution-target]')];
  const flows = [...document.querySelectorAll('.solution-flow')];

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      flows.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.solutionTarget);
      if (target) target.classList.add('active');
    });
  });
});

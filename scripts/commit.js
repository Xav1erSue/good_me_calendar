import dayjs from 'dayjs';
import { getCalendar } from './get-calendar.js';
import { execSync } from 'child_process';

async function commit() {
  const year = dayjs().year();
  await getCalendar(year);
  execSync(`git add .`);
  execSync(`git commit -m "chore(release): update ${year} calendar"`);
  execSync(`git push`);
}

commit();

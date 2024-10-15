import "./scss/style.scss";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const $form = document.querySelector("#form");

const createTogglEntry = (current, end, config) => {
  if (current.isAfter(end)) {
    console.log("done");
    return {
      message: "done",
    };
  }

  const day = current.day();
  if (
    day === 0 ||
    day === 6 ||
    config.holidays.includes(current.format("YYYY-MM-DD"))
  ) {
    return createTogglEntry(current.add(1, "day"), end, config);
  }

  return fetch(`https://api.track.toggl.com/api/v9/time_entries`, {
    // mode: "no-cors",
    // credentials: "include",
    method: "POST",
    body: JSON.stringify({
      created_with: "toggl with wings",
      description: "ALG-78: Xmas",
      duration: 27360,
      pid: config.pid,
      wid: config.wid,
      start: current.set("hour", 9).set("minute", 0).utc().format(),
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${config.authString}`,
    },
  }).then(() => {
    createTogglEntry(current.add(1, "day"), end, config);
  });
};

$form.addEventListener("submit", (e) => {
  e.preventDefault();

  const { api_token, wid, start, end, pid, holidays } = Object.fromEntries(
    new FormData(e.target).entries()
  );
  const holidaysArr = holidays
    .trim()
    .split("\n")
    .map((day) => dayjs(day).format("YYYY-MM-DD"));

  const authString = btoa(`${api_token}:api_token`);

  console.log(
    createTogglEntry(dayjs(start), dayjs(end), {
      holidays: holidaysArr,
      wid: Number(wid),
      authString,
    })
  );
});

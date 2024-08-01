import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 5,
  // duration: "30s",
  thresholds: {
    "http_reqs{expected_response:true}": ["rate>10"],
  },
  stages: [
    { duration: "30s", target: 100 },
    { duration: "3m", target: 100 },
    { duration: "30s", target: 0 },
  ],
};

const creds = JSON.parse(open("/scripts/login_creds.json"));

export const setup = () => {
  const res = http.post(
    `http://localhost/api/auth/login`,
    JSON.stringify({
      email: creds.username,
      password: creds.password,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const token = res.json("data.access_token");
  check(token, {
    "logged in successfully": () => token !== "",
    [JSON.stringify(token)]: true,
  });
  return token;
};

export default async function (token) {
  check(
    http.get(
      "http://localhost/api/products?page=1&pagesize=10&sortkey=name&sortdir=asc",
      {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      },
    ),
    {
      "status is 200": (r) => r.status == 200,
      "protocol is HTTP/2": (r) => r.proto == "HTTP/2.0",
    },
  );
}

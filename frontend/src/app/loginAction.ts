"use server";

export const loginAction = async (formData: FormData) => {
  const { username, password } = Object.fromEntries(formData);

  const response = await fetch(`http://localhost:3000/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    const parsedResponse = await response.json();
    console.log(parsedResponse);
  }
};

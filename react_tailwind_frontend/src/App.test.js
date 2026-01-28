import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders home hero", () => {
  render(<App />);
  const hero = screen.getByText(/Service Center/i);
  expect(hero).toBeInTheDocument();
});

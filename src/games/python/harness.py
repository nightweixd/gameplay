"""Browser-only classroom runner. The worker is disposable, not a trust boundary."""
import ast
import builtins
import io
import json
import sys
import traceback


class BoundedOutput(io.StringIO):
    def write(self, value):
        if self.tell() + len(value) > 20000:
            raise RuntimeError("Output limit reached. Print fewer lines and try again.")
        return super().write(value)


def run_student(source, stdin_text, check_source):
    output = BoundedOutput()
    lights = []
    namespace = {"__name__": "__main__"}
    inputs = iter(stdin_text.replace("\r\n", "\n").split("\n") if stdin_text else [])

    def read_input(prompt=""):
        output.write(str(prompt))
        try:
            value = next(inputs)
        except StopIteration:
            raise EOFError("Add another line in Input values, then run again.") from None
        output.write(value + "\n")
        return value

    def light(colour):
        if colour not in ("blue", "gold", "mint", "coral", "plum"):
            raise ValueError("light() accepts blue, gold, mint, coral or plum.")
        if len(lights) >= 12:
            raise RuntimeError("The trail has room for 12 lanterns. Use fewer calls to light().")
        lights.append(colour)

    namespace.update({"input": read_input, "light": light})
    previous_stdout, previous_stderr = sys.stdout, sys.stderr
    error = ""
    detail = ""
    passed = False
    feedback = "Your program ran. Try changing something and run it again."
    tree = None
    try:
        sys.stdout = output
        sys.stderr = output
        tree = ast.parse(source, filename="main.py")
        exec(compile(tree, "main.py", "exec"), namespace)
        if check_source:
            # Check a few extra cinema inputs without changing the visible run.
            def replay(values):
                replay_namespace = {"__name__": "__main__", "input": lambda prompt="": next(values_iter), "light": lambda colour: None}
                values_iter = iter(values)
                replay_output = BoundedOutput()
                saved = sys.stdout
                try:
                    sys.stdout = replay_output
                    exec(compile(tree, "main.py", "exec"), replay_namespace)
                    return replay_namespace
                finally:
                    sys.stdout = saved

            checks = {"_ns": namespace, "_output": output.getvalue(), "_lights": lights, "_tree": tree, "_ast": ast, "_replay": replay}
            try:
                exec(check_source, checks)
                passed = True
                feedback = "Mission complete! You brought this corner of the carnival to life."
            except AssertionError as issue:
                feedback = str(issue) or "Not quite yet. Re-read the mission goal and try again."
            except Exception:
                feedback = "Your program ran, but a mission check did not finish. Check the goal and try again."
    except Exception as issue:
        error = f"{type(issue).__name__}: {issue}"
        detail = traceback.format_exc(limit=5)
        friendly = {
            "SyntaxError": "Something in the Python syntax needs a fix. Check the line below, quotation marks and colons.",
            "IndentationError": "Check your spaces. Code inside a loop, decision or function needs indentation.",
            "NameError": "Python cannot find a name. Check spelling and define the variable before using it.",
            "EOFError": "Your program needs more input. Add one line for each input() call.",
            "TypeError": "These values do not work together yet. Check whether you need int() or str().",
            "ValueError": "A value is not in the expected format. Check your input and the error below.",
        }
        feedback = friendly.get(type(issue).__name__, "Your program stopped. Read the error below, change your code, and try again.")
    finally:
        sys.stdout, sys.stderr = previous_stdout, previous_stderr

    # Return only bounded, JSON-compatible display values, never HTML or Python proxies.
    def text(name, fallback):
        value = namespace.get(name, fallback)
        return str(value)[:60] if isinstance(value, (str, int, float)) else fallback

    fruits = namespace.get("fruits", [])
    view = {
        "name": text("name", "Explorer"), "coins": text("coins", "?"),
        "age": text("age", "?"), "price": text("price", "?"), "total": text("total", "?"),
        "fruits": [str(item)[:20] for item in fruits[:6]] if isinstance(fruits, list) else [],
        "prices": {key: str(namespace.get("prices", {}).get(key, "?"))[:20] for key in ("juice", "popcorn")} if isinstance(namespace.get("prices"), dict) else {},
        "lights": lights[:12], "count": text("count", "?"),
        "child_ticket": text("child_ticket", "?"), "adult_ticket": text("adult_ticket", "?"),
    }
    return json.dumps({"output": output.getvalue(), "error": error[:2000], "detail": detail[-5000:], "passed": passed, "feedback": feedback, "view": view})

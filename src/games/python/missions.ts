export type Mission = {
  id: string
  module: string
  title: string
  booth: string
  topic: string
  story: string
  goal: string
  starter: string
  inputs: string
  hint: string
  solution: string
  check: string
  lesson: string
}

const course = 'https://geniuss-organization-3.gitbook.io/geniuscode+-python-module'

export const missions: Mission[] = [
  {
    id: 'welcome',
    module: '1 · Introduction',
    title: 'Say hello to Python',
    booth: 'Welcome sign',
    topic: 'Strings & integers',
    story: 'Start small. Put a welcome message and a number on the carnival sign.',
    goal: 'Use print() to show the string "Welcome!" on the first line and the integer 3 on the second line. No variables needed yet.',
    starter: '',
    inputs: '',
    hint: 'Write two print() lines. Put Welcome! inside quotation marks in the first, and the integer 3 without quotation marks in the second.',
    solution: 'print("Welcome!")\nprint(3)\n',
    check:
      'assert _output.strip().splitlines() == ["Welcome!", "3"], "Print Welcome! first, then 3, each on its own line."\nassert any(isinstance(n, _ast.Call) and isinstance(n.func, _ast.Name) and n.func.id == "print" and any(isinstance(a, _ast.Constant) and type(a.value) is int and a.value == 3 for a in n.args) for n in _ast.walk(_tree)), "Print the integer 3 without quotation marks, not the string \'3\'."',
    lesson: `${course}/module-1-introduction-to-python/part-1-string-integer`,
  },
  {
    id: 'variables',
    module: '1 · Introduction',
    title: 'Your explorer pass',
    booth: 'Welcome tent',
    topic: 'Variables',
    story: 'You can print text and numbers. Now store them in two named boxes: name and coins.',
    goal: 'Set name to your made-up explorer name and coins to 3. Use print() to show name and coins on separate lines.',
    starter: '',
    inputs: '',
    hint: 'A variable stores a value under a name. Try name = "Nova" and coins = 3. Then write print(name) and print(coins).',
    solution: 'name = "Nova"\ncoins = 3\nprint(name)\nprint(coins)\n',
    check:
      'assert isinstance(_ns.get("name"), str) and _ns["name"].strip(), "Give name some text in quotation marks."\nassert type(_ns.get("coins")) is int and _ns["coins"] == 3, "Set coins to the integer 3, not the string \'3\'."\nassert _ns["name"] in _output, "Print a welcome message that includes name."',
    lesson: `${course}/module-1-introduction-to-python/part-1-string-integer`,
  },
  {
    id: 'cinema',
    module: '1 · Introduction',
    title: 'Open the cinema',
    booth: 'Moonlight cinema',
    topic: 'Input & if / else',
    story: 'A young visitor wants a cinema ticket. Under 12s pay 5 coins; everyone else pays 10.',
    goal: 'Read age with input(), convert it to an integer, and use if / else to set price: 5 when age < 12, otherwise 10. Try changing the input too.',
    starter: '',
    inputs: '9',
    hint: 'Start with if age < 12: and indent price = 5 underneath. Then write else: with price = 10 indented underneath.',
    solution:
      'age = int(input("Your age: "))\nif age < 12:\n    price = 5\nelse:\n    price = 10\nprint("Ticket:", price, "coins")\n',
    check:
      'assert any(isinstance(n, _ast.If) for n in _ast.walk(_tree)), "Use an if / else decision for the two prices."\nassert type(_ns.get("age")) is int, "Convert the age to an integer with int()."\nassert _ns.get("price") == (5 if _ns["age"] < 12 else 10), "Under 12s pay 5 coins. Ages 12 and above pay 10."\nfor _age in (7, 12, 18):\n    _test = _replay([str(_age)])\n    assert _test.get("price") == (5 if _age < 12 else 10), "Your price should also work for ages 7, 12 and 18. Check both branches."',
    lesson: `${course}/module-1-introduction-to-python/part-5-cinema-price`,
  },
  {
    id: 'basket',
    module: '2 · Lists',
    title: 'Pack the fruit basket',
    booth: 'Fruit grove',
    topic: 'Lists & append()',
    story: 'The fruit stall has apples and bananas. Add an orange so the picnic can begin.',
    goal: 'Create a fruits list containing "apple" and "banana". Add "orange" with append(), then print the list.',
    starter: '',
    inputs: '',
    hint: 'List methods use a dot: fruits.append("orange"). This adds a new item at the end.',
    solution: 'fruits = ["apple", "banana"]\nfruits.append("orange")\nprint(fruits)\n',
    check:
      'assert _ns.get("fruits") == ["apple", "banana", "orange"], "Your basket needs apple, banana and orange in that order."\nassert any(isinstance(n, _ast.Call) and isinstance(n.func, _ast.Attribute) and n.func.attr == "append" for n in _ast.walk(_tree)), "Practise adding an item with append()."',
    lesson: `${course}/module-2-lists/part-2-fruits-basket`,
  },
  {
    id: 'shop',
    module: '3 · Dictionary',
    title: 'Stock the snack shop',
    booth: 'Snack stop',
    topic: 'Dictionary keys & values',
    story:
      'The snack stall needs its final price tag. Add popcorn and work out a juice-and-popcorn total.',
    goal: 'Create prices with "juice": 3 and "sandwich": 6, then add "popcorn": 4. Set total to the cost of juice plus popcorn by reading the dictionary values.',
    starter: '',
    inputs: '',
    hint: 'Add a key with prices["popcorn"] = 4. Then total = prices["juice"] + prices["popcorn"].',
    solution:
      'prices = {"juice": 3, "sandwich": 6}\nprices["popcorn"] = 4\ntotal = prices["juice"] + prices["popcorn"]\nprint("Snack total:", total)\n',
    check:
      'assert _ns.get("prices") == {"juice": 3, "sandwich": 6, "popcorn": 4}, "Keep the original prices and add popcorn with a value of 4."\nassert _ns.get("total") == 7, "Juice plus popcorn costs 7 coins."\nassert any(isinstance(n, _ast.Subscript) and isinstance(n.value, _ast.Name) and n.value.id == "prices" for n in _ast.walk(_tree)), "Use square brackets to read the prices dictionary."',
    lesson: `${course}/module-3-dictionary/part-4-mini-online-shop-viewer`,
  },
  {
    id: 'countdown',
    module: '4 · While loop',
    title: 'Launch the countdown',
    booth: 'Rocket ride',
    topic: 'While loops',
    story: 'The rocket ride is ready. Count down from three, then send it on its way.',
    goal: 'Set count to 3. Use a while loop to print 3, 2 and 1 on separate lines. Decrease count each time. After the loop, print "Go!".',
    starter: '',
    inputs: '',
    hint: 'Use while count > 0: with two indented lines: print(count) and count -= 1. Keep print("Go!") outside the loop.',
    solution: 'count = 3\nwhile count > 0:\n    print(count)\n    count -= 1\nprint("Go!")\n',
    check:
      'assert any(isinstance(n, _ast.While) for n in _ast.walk(_tree)), "Use a while loop for the countdown."\nassert _output.strip().splitlines() == ["3", "2", "1", "Go!"], "Print 3, 2, 1, then Go! on separate lines."\nassert _ns.get("count") == 0, "Decrease count until it reaches zero."',
    lesson: `${course}/module-4-while-loop/part-1-basic-counting`,
  },
  {
    id: 'lanterns',
    module: '5 · For loop',
    title: 'Light the lantern trail',
    booth: 'Lantern lane',
    topic: 'For loops & lists',
    story: 'The sun is setting. Use a loop to switch on every lantern along the trail.',
    goal: 'Create a colours list containing "blue", "gold", "mint" and "coral" in order. Loop through it with for and call light(colour) for each item.',
    starter: '',
    inputs: '',
    hint: 'Write for colour in colours: and put light(colour) on the next line with four spaces before it. light() is a special Carnival helper.',
    solution:
      'colours = ["blue", "gold", "mint", "coral"]\nfor colour in colours:\n    light(colour)\n',
    check:
      'assert any(isinstance(n, _ast.For) for n in _ast.walk(_tree)), "Use a for loop to visit the colours list."\nassert _lights == ["blue", "gold", "mint", "coral"], "Light blue, gold, mint and coral in that order, once each."',
    lesson: `${course}/module-5-for-loop/part-1-loop-through-a-list`,
  },
  {
    id: 'functions',
    module: '6 · Functions',
    title: 'Build the ticket machine',
    booth: 'Festival finale',
    topic: 'Parameters & return values',
    story:
      'The whole carnival needs tickets now. Build a reusable function so every visitor gets the correct price.',
    goal: 'Define ticket_price(age). Return 5 for ages below 12 and 10 otherwise. Set child_ticket by calling it with 8, and adult_ticket by calling it with 16, then print both results.',
    starter: '',
    inputs: '',
    hint: 'Inside the function, use if age < 12: return 5. Otherwise return 10. Indent the return lines inside their branches.',
    solution:
      'def ticket_price(age):\n    if age < 12:\n        return 5\n    else:\n        return 10\n\nchild_ticket = ticket_price(8)\nadult_ticket = ticket_price(16)\nprint(child_ticket, adult_ticket)\n',
    check:
      'assert any(isinstance(n, _ast.FunctionDef) and n.name == "ticket_price" for n in _ast.walk(_tree)), "Define a function named ticket_price with an age parameter."\nassert callable(_ns.get("ticket_price")), "ticket_price must be a function."\nfor _age in (0, 8, 12, 16, 30):\n    assert _ns["ticket_price"](_age) == (5 if _age < 12 else 10), "Return 5 for under 12s and 10 for everyone else, including age 12."\nassert _ns.get("child_ticket") == 5 and _ns.get("adult_ticket") == 10, "Call your function to set child_ticket and adult_ticket."\nassert "5" in _output and "10" in _output, "Print both ticket results."',
    lesson: `${course}/module-6-function/part-3-return-values`,
  },
]

export const FREE_CODE = ''
export const FREE_INPUT = ''
export const COLOURS = ['blue', 'gold', 'mint', 'coral', 'plum'] as const

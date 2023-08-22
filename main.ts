// Gotchas:
// You can't skip past the end of a string
// You can't delete past the end of a string
// Delete operations are applied forward while keeping the cursor in place

type Op = "skip" | "insert" | "delete"

interface OTJson {
  op: string;
  count: number;
  chars?: string;
}

function skipOp(ptr: number, stale: string, count: number) {
  if (ptr + count > stale.length - 1) {
    throw new Error("You can't skip past the end of a string");
  }

  return ptr + count;
}

function insertOp(ptr: number, stale: string, inserted: string): [string, number] {
  const array = [...stale];
  array.splice(ptr, 0, inserted);
  const latest = array.join('');
  return [latest, ptr + inserted.length]
}

function deleteOp(ptr: number, stale: string, deleteCount: number) {
  if (ptr > stale.length - 1) {
    throw new Error("You can't delete past the end of a string");
  }

  const array = [...stale];
  array.splice(ptr, deleteCount);
  const latest = array.join('');

  return latest;
}

function isValid(stale: string, latest: string, otjson: string): boolean {
  // this is the part you will write!
  const json: OTJson[] = JSON.parse(otjson);
  let ptr = 0;
  let updated = stale;

  let illegal = false;

  json.forEach(operation => {
    try {
      switch(operation.op) {
        case "skip":
          ptr = skipOp(ptr, updated, operation.count);
          break;
        case "insert":
          [updated, ptr] = insertOp(ptr, updated, operation.chars as string);
          break;
        case "delete":
          updated = deleteOp(ptr, updated, operation.count);
          break;
      }
    } catch (err) {
      console.error(err);
      illegal = true;
    }
  });

  if (updated === latest && !illegal) {
    return true;
  }

  return false;
}

function runTests() {
    console.log("Expected:", "true false false true false true");
  console.log(
    "Actual:",
    isValid(
      'Repl.it uses operational transformations to keep everyone in a multiplayer repl in sync.',
      'Repl.it uses operational transformations.',
      '[{"op": "skip", "count": 40}, {"op": "delete", "count": 47}]'
    ), // true
    
    isValid(
      'Repl.it uses operational transformations to keep everyone in a multiplayer repl in sync.',
      'Repl.it uses operational transformations.',
      '[{"op": "skip", "count": 45}, {"op": "delete", "count": 47}]'
    ), // false, delete past end
    
    isValid(
      'Repl.it uses operational transformations to keep everyone in a multiplayer repl in sync.',
      'Repl.it uses operational transformations.',
      '[{"op": "skip", "count": 40}, {"op": "delete", "count": 47}, {"op": "skip", "count": 2}]'
    ), // false, skip past end
    
    isValid(
      'Repl.it uses operational transformations to keep everyone in a multiplayer repl in sync.',
      'We use operational transformations to keep everyone in a multiplayer repl in sync.',
      '[{"op": "delete", "count": 7}, {"op": "insert", "chars": "We"}, {"op": "skip", "count": 4}, {"op": "delete", "count": 1}]'
    ), // true
      
    isValid(
      'Repl.it uses operational transformations to keep everyone in a multiplayer repl in sync.',
      'We can use operational transformations to keep everyone in a multiplayer repl in sync.',
      '[{"op": "delete", "count": 7}, {"op": "insert", "chars": "We"}, {"op": "skip", "count": 4}, {"op": "delete", "count": 1}]'
    ), // false
    
    isValid(
      'Repl.it uses operational transformations to keep everyone in a multiplayer repl in sync.',
      'Repl.it uses operational transformations to keep everyone in a multiplayer repl in sync.',
      '[]'
    ), // true
  );
}

runTests();

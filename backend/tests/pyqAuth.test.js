const assert = require('assert');
const { authorize } = require('../src/middleware/admin');

function runAuthTests() {
  console.log('\n--- 8. Testing Authorization Middleware ---');
  
  const adminGuard = authorize('admin', 'superadmin');

  // Case A: Unauthenticated request
  let unauthStatus = null;
  let unauthPayload = null;
  const mockReqUnauth = { user: null };
  const mockResUnauth = {
    status(code) {
      unauthStatus = code;
      return {
        json(data) {
          unauthPayload = data;
        }
      };
    }
  };
  adminGuard(mockReqUnauth, mockResUnauth, () => {
    assert.fail('Unauthenticated request must not call next()');
  });
  assert.strictEqual(unauthStatus, 403);
  assert.strictEqual(unauthPayload.success, false);

  // Case B: Student / Regular user request
  let studentStatus = null;
  const mockReqStudent = { user: { id: 'u1', role: 'user' } };
  const mockResStudent = {
    status(code) {
      studentStatus = code;
      return { json() {} };
    }
  };
  adminGuard(mockReqStudent, mockResStudent, () => {
    assert.fail('Student role must not call next() for admin sync endpoints');
  });
  assert.strictEqual(studentStatus, 403);

  // Case C: Admin request
  let adminNextCalled = false;
  const mockReqAdmin = { user: { id: 'u2', role: 'admin' } };
  adminGuard(mockReqAdmin, {}, () => {
    adminNextCalled = true;
  });
  assert.strictEqual(adminNextCalled, true, 'Admin role must be permitted to proceed');

  // Case D: Superadmin request
  let superadminNextCalled = false;
  const mockReqSuperadmin = { user: { id: 'u3', role: 'superadmin' } };
  adminGuard(mockReqSuperadmin, {}, () => {
    superadminNextCalled = true;
  });
  assert.strictEqual(superadminNextCalled, true, 'Superadmin role must be permitted to proceed');

  console.log('✓ Admin and student authorization guards passed');
}

module.exports = { runAuthTests };

if (require.main === module) {
  runAuthTests();
}

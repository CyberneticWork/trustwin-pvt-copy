import { connectDB } from '@/lib/db';

export const GET = async () => {
  try {
    const db = await connectDB();
    const [rows] = await db.execute('SELECT * FROM roles');
    return new Response(JSON.stringify({ code: 'SUCCESS', data: rows }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return new Response(
      JSON.stringify({ code: 'ERROR', message: 'Failed to fetch roles' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST = async (req) => {
  try {
    const { role_key, role_value } = await req.json();
    const db = await connectDB();
    const [result] = await db.execute(
      'INSERT INTO roles (role_key, role_value) VALUES (?, ?)',
      [role_key, role_value]
    );

    return new Response(
      JSON.stringify({ code: 'SUCCESS', insertedId: result.insertId }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error adding role:', error);
    return new Response(
      JSON.stringify({ code: 'ERROR', message: 'Failed to add role' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const PUT = async (req) => {
  try {
    const { id, role_key, role_value } = await req.json();
    const db = await connectDB();
    await db.execute(
      'UPDATE roles SET role_key = ?, role_value = ? WHERE id = ?',
      [role_key, role_value, id]
    );

    return new Response(
      JSON.stringify({ code: 'SUCCESS', message: 'Role updated' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating role:', error);
    return new Response(
      JSON.stringify({ code: 'ERROR', message: 'Failed to update role' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const DELETE = async (req) => {
  try {
    const { id } = await req.json();
    const db = await connectDB();
    await db.execute('DELETE FROM roles WHERE id = ?', [id]);

    return new Response(
      JSON.stringify({ code: 'SUCCESS', message: 'Role deleted' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting role:', error);
    return new Response(
      JSON.stringify({ code: 'ERROR', message: 'Failed to delete role' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

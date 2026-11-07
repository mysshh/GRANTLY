import { db } from "hatchable";

export const access = "user";
export const methods = ["GET", "PUT"];

export default async function (req, res) {
  const userId = req.user.id;
  if (req.method === "GET") {
    const { rows } = await db.query(
      "SELECT full_name, institution, course, study_level, study_year, state, category, family_income, academic_score, achievements, updated_at FROM student_profiles WHERE user_id = $1",
      [userId]
    );
    return res.json({ profile: rows[0] || null, email: req.user.email });
  }
  const p = req.body || {};
  const values = [
    String(p.full_name || "").slice(0, 120),
    String(p.institution || "").slice(0, 180),
    String(p.course || "").slice(0, 120),
    String(p.study_level || "").slice(0, 80),
    String(p.study_year || "").slice(0, 40),
    String(p.state || "").slice(0, 80),
    String(p.category || "").slice(0, 50),
    String(p.family_income || "").slice(0, 40),
    String(p.academic_score || "").slice(0, 80),
    String(p.achievements || "").slice(0, 1500)
  ];
  const { rows } = await db.query(
    `INSERT INTO student_profiles
      (user_id, full_name, institution, course, study_level, study_year, state, category, family_income, academic_score, achievements, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
     ON CONFLICT (user_id) DO UPDATE SET
      full_name=EXCLUDED.full_name, institution=EXCLUDED.institution, course=EXCLUDED.course,
      study_level=EXCLUDED.study_level, study_year=EXCLUDED.study_year, state=EXCLUDED.state,
      category=EXCLUDED.category, family_income=EXCLUDED.family_income, academic_score=EXCLUDED.academic_score,
      achievements=EXCLUDED.achievements, updated_at=NOW()
     RETURNING updated_at`,
    [userId, ...values]
  );
  return res.json({ ok: true, updated_at: rows[0].updated_at });
}
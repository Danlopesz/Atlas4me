"""
Lê o CSV de country_features (perguntas 86-110) e gera inserts SQL
compactos (uma linha por par país+pergunta) no final de V2__insert_initial_data.sql.

Uso:
  1. Coloque o CSV na mesma pasta deste script.
  2. Ajuste CSV_FILENAME e V2_PATH se necessário.
  3. Execute: python gen_country_features_q86_110.py
  4. O arquivo SQL terá os inserts anexados ao final.
"""

import csv
import os

# ── configuração ───────────────────────────────────────────────────────────────
SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
CSV_FILENAME = "DB-Atlas4me - CountryFeatures.csv"
CSV_PATH     = os.path.join(SCRIPT_DIR, CSV_FILENAME)

V2_PATH = os.path.join(
    SCRIPT_DIR,
    "..", "resources", "db", "migration",
    "V2__insert_initial_data.sql"
)
V2_PATH = os.path.normpath(V2_PATH)

# question_id de início (coluna de dados começa no índice 2 do CSV)
Q_START       = 86
DATA_COL_START = 2
# ──────────────────────────────────────────────────────────────────────────────


def parse_csv(path: str):
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        rows = list(reader)
    q_count = len(header) - DATA_COL_START   # deve ser 25
    return rows, q_count


def build_values(rows, q_count) -> list[str]:
    values = []
    for row in rows:
        iso = row[0].strip()
        if not iso:
            continue
        for i in range(q_count):
            q_id  = Q_START + i
            raw   = row[DATA_COL_START + i].strip()
            bval  = "TRUE" if raw == "1" else "FALSE"
            values.append(
                f"((SELECT id FROM countries WHERE iso_code = '{iso}'), {q_id}, {bval})"
            )
    return values


def generate_sql(values: list[str]) -> str:
    header = "INSERT IGNORE INTO country_features (country_id, question_id, is_true) VALUES"
    lines  = [header]
    for i, v in enumerate(values):
        suffix = "," if i < len(values) - 1 else ";"
        lines.append(v + suffix)
    return "\n".join(lines)


def append_to_v2(sql: str, v2_path: str):
    with open(v2_path, "a", encoding="utf-8") as f:
        f.write("\n")
        f.write(sql)
        f.write("\n")


def main():
    print(f"CSV : {CSV_PATH}")
    print(f"V2  : {V2_PATH}")

    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"CSV não encontrado: {CSV_PATH}")
    if not os.path.exists(V2_PATH):
        raise FileNotFoundError(f"V2 não encontrado: {V2_PATH}")

    rows, q_count = parse_csv(CSV_PATH)
    print(f"Países lidos       : {len(rows)}")
    print(f"Perguntas por país : {q_count}  (IDs {Q_START}–{Q_START + q_count - 1})")

    values = build_values(rows, q_count)
    expected = len(rows) * q_count
    print(f"Total de valores   : {len(values)}  (esperado: {expected})")
    assert len(values) == expected, "Contagem incorreta!"

    sql = generate_sql(values)

    # preview das primeiras e últimas linhas
    preview_lines = sql.splitlines()
    print("\n--- Prévia (primeiras 4 linhas) ---")
    for ln in preview_lines[:4]:
        print(ln)
    print("...")
    print("--- Prévia (últimas 2 linhas) ---")
    for ln in preview_lines[-2:]:
        print(ln)

    confirm = input(f"\nAnexar {len(values)} linhas ao V2? [s/N] ").strip().lower()
    if confirm != "s":
        print("Operação cancelada.")
        return

    append_to_v2(sql, V2_PATH)
    print(f"\nConcluído! {len(values)} linhas inseridas em:\n  {V2_PATH}")


if __name__ == "__main__":
    main()

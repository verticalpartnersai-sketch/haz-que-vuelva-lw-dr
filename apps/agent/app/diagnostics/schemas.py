from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class DiagnosticRequest(BaseModel):
    diagnostic_id: UUID
    generation_id: UUID
    member_id: UUID
    conversation_id: UUID
    input_format: Literal["txt", "zip"]
    payload_base64: str = Field(min_length=4, max_length=1_500_000)
    allowed_product_codes: list[str] = Field(max_length=6)


class DiagnosticReport(BaseModel):
    situacion_actual: str
    dinamica_de_la_conversacion: str
    estado_emocional_observado: str
    nivel_de_reciprocidad: str
    patrones_que_aumentan_la_distancia: list[str]
    senales_que_aun_favorecen_apertura: list[str]
    riesgos_y_limites: list[str]
    que_interrumpir_ahora: list[str]
    proximas_72_horas: list[str]
    ruta_de_7_dias: list[str]
    mensaje_sugerido: str | None
    nota_de_seguridad: str | None

    def as_text(self) -> str:
        sections = [
            ("Diagnóstico central", self.situacion_actual),
            ("Dinámica observada", self.dinamica_de_la_conversacion),
            ("Estado emocional", self.estado_emocional_observado),
            ("Reciprocidad", self.nivel_de_reciprocidad),
        ]
        lines = [f"## {title}\n\n{body}" for title, body in sections]
        list_sections = [
            ("Patrones que aumentan la distancia", self.patrones_que_aumentan_la_distancia),
            ("Señales de apertura", self.senales_que_aun_favorecen_apertura),
            ("Riesgos y límites", self.riesgos_y_limites),
            ("Qué interrumpir ahora", self.que_interrumpir_ahora),
            ("Próximas 72 horas", self.proximas_72_horas),
            ("Ruta de 7 días", self.ruta_de_7_dias),
        ]
        lines.extend(
            f"## {title}\n\n" + "\n".join(f"- {item}" for item in items)
            for title, items in list_sections
        )
        if self.mensaje_sugerido:
            message = self.mensaje_sugerido.replace("\n", "\n> ")
            lines.append(f"## Mensaje sugerido\n\n> {message}")
        if self.nota_de_seguridad:
            lines.append(f"## Nota de seguridad\n\n{self.nota_de_seguridad}")
        return "\n\n".join(lines)


class DiagnosticResponse(BaseModel):
    diagnostic_id: UUID
    report: DiagnosticReport
    formatted_report: str
    messages_remaining: int = Field(ge=0)

# 동현초™: 출처·가공 내역·이용 조건

동현초는 실제 공개 연결망의 일부로 신경 반응을 계산하는 독립 비영리 교육용 앱이다. FlyWire가 제작·검수·인증·후원한 공식 앱이 아니며, 그림 속 몸체는 자체 제작한 만화 표현이다.

## 데이터와 기여자

데이터 출처는 FlyWire Consortium 및 아래 원 연구의 연구진이다. Princeton FlyWire 팀, Murthy·Seung 연구실, 교정·주석 기여자들에게 감사한다. FlyWire의 개발과 유지에 대한 BRAIN Initiative grant MH117815 지원은 공식 기여자 안내에 기재되어 있다. [FlyWire 기여자 안내](https://edit.flywire.ai/credits.html).

사용한 데이터는 v783 연결 파일과 주석 저장소 v3.2.0이다. 전뇌 파일은 MIT 모델 저장소에서 받았지만, 코드 라이선스가 원자료의 별도 이용 조건을 대신하는 것은 아니다. [FlyWire 공개 데이터 안내](https://flywire.ai/guidelines), [원 모델 저장소](https://github.com/philshiu/Drosophila_brain_model).

## 관련 연구와 역할

FlyWire 공식 인용표는 Dorkenwald·Schlegel 연구의 공동 인용과 사용한 데이터 항목에 해당하는 연구의 인용을 요청한다. 이 앱은 2024년 모델 저장소의 연결 파일을 사용하므로 2025년 7월 이후 새 시냅스 추정으로 교체한 앱이 아니다. [공식 인용표](https://docs.google.com/spreadsheets/d/1eOPxOYoalArVDIhzVis3CsKjETzkdFkRtXSHHY3XdSU/gviz/tq?tqx=out:html&sheet=Data).

- **연결망:** Dorkenwald 등 (2024), “Neuronal wiring diagram of an adult brain.” https://doi.org/10.1038/s41586-024-07558-y
- **주석:** Schlegel 등 (2024), “Whole-brain annotation and multi-connectome cell typing of Drosophila.” https://doi.org/10.1038/s41586-024-07686-5
- **원 전자현미경 영상:** Zheng·Lauritzen 등 (2018). https://doi.org/10.1016/j.cell.2018.06.019
- **시냅스 예측:** Buhmann 등 (2021). https://doi.org/10.1038/s41592-021-01183-7
- **관련 시냅스 검출 방법:** Heinrich 등 (2018). https://doi.org/10.1007/978-3-030-00934-2_36
- **전달물질 예측:** Eckstein·Bates 등 (2024). https://doi.org/10.1016/j.cell.2024.03.016
- **시각계 주석:** Matsliah 등 (2024), “Neuronal parts list and wiring diagram for a visual system.” https://doi.org/10.1038/s41586-024-07981-1
- **미각 주석:** Tastekin 등 (2026), “The complete gustatory connectome of adult Drosophila reveals how taste guides feeding, foraging, and social behavior.” https://doi.org/10.1016/j.cell.2026.08.016
- **주석의 비교·개정:** Berg 등 (2026), “Sexual dimorphism in the complete Drosophila male central nervous system connectome.” https://doi.org/10.1016/j.cell.2026.08.015
- **계산 모델:** Shiu 등 (2024), “A Drosophila computational brain model reveals sensorimotor processing.” https://www.nature.com/articles/s41586-024-07763-9

현재 사용한 주석 v3.2.0은 Berg, Schlegel, Tastekin, Matsliah, Dorkenwald의 다섯 연구를 인용하도록 안내한다. 신경세포 일부만 쓰더라도 주석의 버전과 원 연구를 숨기지 않기 위해 모두 표시했다. [주석 저장소의 인용 안내](https://github.com/flyconnectome/flywire_annotations).

## 가공 사실

- 원 v783 파일에서 뉴런 1,758개와 방향성 연결 121,135개를 추출·재색인했다.
- 원본 root ID는 문자열로 보존했으며 원본 연결값은 변경하지 않았다.
- 감각·관측 그룹, 팔로우하는 출력 뉴런 및 조작용 그룹을 추가했다.
- v0.2에서 기존 축소 회로에 있던 뉴런 중 top_nt=도파민이며 known_nt에도 도파민이 표시된 8개를 그룹화했다. 새 뉴런·연결을 합성하거나 전뇌를 추가한 것이 아니다.
- 몸체, 걷기·충돌 처리, 자극 구역, 동현랭 입출력 어댑터, 만화 그림은 동현초의 별도 구현이다.
- 이 축소·변환 때문에 새로운 실험에서 전뇌 결과와 같다는 보장은 없다.

추출 과정, 고정 커밋, root ID, 해시와 시험 범위는 앱에 포함된 데이터 계보 문서에 보존했다.

## 라이선스와 재배포

FlyWire 공식 지침은 공개 데이터의 라이선스를 **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**으로 안내한다. 이 앱은 그 지침을 기준으로 비영리 교육용으로 제공하며, 원 기여자·원자료·라이선스·기존 및 새 변경 사실·제공된 고지 등을 유지한다. [공식 지침](https://flywire.ai/guidelines), [라이선스 요약](https://creativecommons.org/licenses/by-nc/4.0/), [법적 전문 Section 2·3·4](https://creativecommons.org/licenses/by-nc/4.0/legalcode.en).

**배포처 간 표기 차이가 있다.** v783 연결 데이터의 [Zenodo 레코드 10676866](https://zenodo.org/records/10676866)는 페이지와 구조화 메타데이터에서 CC BY 4.0을 표시한다. 이는 공식 사이트의 CC BY-NC 4.0과 일치하지 않는다. 어느 표기가 현재 합성 파일·주석·파생 데이터 전체에 우선하는지 이 검토만으로 확정하지 않는다. 더 느슨한 조건을 임의로 채택하지 않았으며, 이 문서가 원자료에 이미 부여된 개별 이용허락을 변경하는 것도 아니다. 영리 재사용이나 별도 데이터 배포 전에는 FlyWire 및 해당 자료의 권리자에게 적용 조건을 확인해야 한다.

원자료는 있는 그대로 제공되며 정확성, 특정 목적 적합성, 권리 비침해 등에 대해 라이선스가 정한 범위에서 보증하지 않는다. 라이선스가 FlyWire의 공식 승인·후원을 주장할 권리를 주는 것도 아니다. [법적 전문 Section 2(a)(6)·5](https://creativecommons.org/licenses/by-nc/4.0/legalcode.en).

- **Shiu 모델 코드:** MIT, Copyright (c) 2023 Philip Shiu and Nico Spiller. 원문을 `SHIU-MIT.txt`로 보존했다.
- **동현랭 런타임:** MIT, 원 라이선스를 `DONGHYUN-MIT.txt`로 보존했다.
- **글꼴:** Black Han Sans, Nanum Gothic Coding, Pretendard. 각 SIL OFL 전문을 웹판과 단일 HTML에 포함했다.
- **데이터 포함 HTML:** MIT 코드가 들어 있다고 전체 데이터 포함 파일을 제한 없는 MIT로 재배포해서는 안 된다. 개별 원자료의 표기 차이도 위와 같이 함께 유지한다.

## 이번 점검의 범위

2026-10-23에 공개 이용 지침, 내장 인용표, 사용한 주석 버전의 인용 안내, CC BY-NC 4.0 법문을 대조해 표시를 보강했다. 이는 고지 항목의 문서 점검이며, 어떤 배포 상황에서도 법적 문제가 없다는 보증이나 법률 자문은 아니다. 상업화·유료 서비스·별도 데이터 사용은 권리자에게 조건을 다시 확인해야 한다.

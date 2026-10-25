# 동현초™: 출처·가공 내역·이용 조건

동현초는 실제 공개 연결망의 일부로 신경 반응을 계산하는, 비영리 교육용 실험실이다. 많은 연구자가 공개해 준 자료 덕분에 만들 수 있었다. 다만 FlyWire가 만들거나 검수·인증·후원한 공식 앱은 아니며, 화면 속 초파리의 몸은 동현초에서 직접 그린 만화 그림이다.

## 데이터를 만든 사람들

데이터는 FlyWire Consortium과 아래 원 연구의 연구진이 만든 것이다. Princeton FlyWire 팀, Murthy·Seung 연구실, 그리고 교정과 주석에 참여한 모든 기여자에게 감사한다. FlyWire의 개발과 유지를 BRAIN Initiative grant MH117815가 지원했다는 사실은 공식 기여자 안내에 나와 있다. [FlyWire 기여자 안내](https://edit.flywire.ai/credits.html)

동현초가 쓴 데이터는 v783 연결 파일과 주석 저장소 v3.2.0이다. 뇌 전체 연결 파일은 MIT 라이선스인 모델 저장소에서 받았지만, 코드의 라이선스가 원자료의 이용 조건까지 대신하지는 않는다. [FlyWire 공개 데이터 안내](https://flywire.ai/guidelines), [원 모델 저장소](https://github.com/philshiu/Drosophila_brain_model)

## 인용한 연구

FlyWire 공식 인용표는 Dorkenwald·Schlegel 연구를 함께 인용하고, 사용한 데이터에 해당하는 연구도 인용하도록 요청한다. 동현초는 2024년 모델 저장소의 연결 파일을 쓰므로, 2025년 7월 이후의 새 시냅스 추정치는 반영되어 있지 않다. [공식 인용표](https://docs.google.com/spreadsheets/d/1eOPxOYoalArVDIhzVis3CsKjETzkdFkRtXSHHY3XdSU/gviz/tq?tqx=out:html&sheet=Data)

- **연결망:** Dorkenwald 등 (2024), “Neuronal wiring diagram of an adult brain.” https://doi.org/10.1038/s41586-024-07558-y
- **주석:** Schlegel 등 (2024), “Whole-brain annotation and multi-connectome cell typing of Drosophila.” https://doi.org/10.1038/s41586-024-07686-5
- **원 전자현미경 영상:** Zheng·Lauritzen 등 (2018). https://doi.org/10.1016/j.cell.2018.06.019
- **시냅스 예측:** Buhmann 등 (2021). https://doi.org/10.1038/s41592-021-01183-7
- **관련 시냅스 검출 방법:** Heinrich 등 (2018). https://doi.org/10.1007/978-3-030-00934-2_36
- **전달물질 예측:** Eckstein·Bates 등 (2024). https://doi.org/10.1016/j.cell.2024.03.016
- **시각계 주석:** Matsliah 등 (2024), “Neuronal parts list and wiring diagram for a visual system.” https://doi.org/10.1038/s41586-024-07981-1
- **미각 주석:** Tastekin 등 (2026), “The complete gustatory connectome of adult Drosophila reveals how taste guides feeding, foraging, and social behavior.” https://doi.org/10.1016/j.cell.2026.08.016
- **주석의 비교·개정:** Berg 등 (2026), “Sexual dimorphism in the complete Drosophila male central nervous system connectome.” https://doi.org/10.1016/j.cell.2026.08.015
- **예제 07·10번의 행동 참고:** Gibson 등 (2015), “Behavioral responses to a repetitive visual threat stimulus express a persistent state of defensive arousal in Drosophila.” https://doi.org/10.1016/j.cub.2015.03.058
- **DNa02 방향 전환 참고:** Rayshubskiy 등 (2025), “Neural circuit mechanisms for steering control in walking Drosophila.” https://doi.org/10.7554/eLife.102230
- **계산 모델:** Shiu 등 (2024), “A Drosophila computational brain model reveals sensorimotor processing.” https://www.nature.com/articles/s41586-024-07763-9

주석 v3.2.0은 Berg, Schlegel, Tastekin, Matsliah, Dorkenwald의 다섯 연구를 인용하도록 안내한다. 뉴런 일부만 쓰지만, 어떤 버전의 주석에서 왔는지 분명히 하려고 다섯 연구 모두 기재. [주석 저장소의 인용 안내](https://github.com/flyconnectome/flywire_annotations)

## 동현초가 손댄 부분

- 원 v783 파일에서 뉴런 1,758개와 방향성 연결 121,135개를 추려 번호 새로 부여.
- 원본 root ID는 문자열로 그대로 보존. 연결값 변경 없음.
- 감각·관측 그룹, 따라가며 읽는 출력 뉴런, 조작용 그룹 정의.
- v0.2에서는 이미 회로에 들어 있던 뉴런 가운데 top_nt가 도파민이고 known_nt에도 도파민이 표시된 8개를 한 그룹으로 묶음. 새 뉴런이나 연결을 만들어 넣은 것도, 뇌 전체를 다시 들여온 것도 아니다.
- 몸, 걷기와 충돌 처리, 자극 구역, 동현랭 입출력 어댑터, 만화 그림은 동현초에서 별도 제작.
- 이렇게 줄이고 바꾼 탓에, 새로운 실험에서 뇌 전체 모델과 같은 결과가 나온다고 장담할 수는 없다.

추출 과정, 고정한 커밋, root ID, 해시, 시험 범위는 앱에 들어 있는 데이터 계보 문서에 기록.

## 라이선스와 다시 배포할 때

FlyWire 공식 지침은 공개 데이터의 라이선스를 **Creative Commons Attribution-NonCommercial 4.0 International** (CC BY-NC 4.0)로 안내한다. 동현초는 이 지침에 따라 비영리 교육용으로 제공하며, 원 기여자와 원자료, 라이선스, 변경 사실, 제공된 고지를 함께 남긴다. [공식 지침](https://flywire.ai/guidelines), [라이선스 요약](https://creativecommons.org/licenses/by-nc/4.0/), [법적 전문 Section 2·3·4](https://creativecommons.org/licenses/by-nc/4.0/legalcode.en)

**배포처마다 표기가 다르다는 점도 알려 둔다.** v783 연결 데이터의 [Zenodo 레코드 10676866](https://zenodo.org/records/10676866)은 CC BY 4.0을 표시하고 있어, 공식 사이트의 CC BY-NC 4.0과 다르다. 어느 쪽이 합성 파일과 주석, 파생 데이터 전체에 우선하는지는 확정할 수 없었다. 그래서 동현초는 더 느슨한 쪽을 고르지 않고 공식 지침을 따랐다. 이 문서가 원자료에 이미 붙은 이용허락을 바꾸지는 않는다. 영리 목적으로 다시 쓰거나 데이터를 따로 배포하려면 FlyWire와 해당 자료의 권리자에게 먼저 확인해 주길 바란다.

원자료는 있는 그대로 제공되며, 라이선스가 정한 범위 안에서 정확성이나 특정 목적에의 적합성, 권리 비침해를 보증하지 않는다. 라이선스를 따른다고 해서 FlyWire의 공식 승인이나 후원을 받았다고 말할 수 있는 것도 아니다. [법적 전문 Section 2(a)(6)·5](https://creativecommons.org/licenses/by-nc/4.0/legalcode.en)

- **Shiu 모델 코드:** MIT, Copyright (c) 2023 Philip Shiu and Nico Spiller. 원문은 `SHIU-MIT.txt`에 있다.
- **동현랭 실행기:** MIT. 원 라이선스는 `DONGHYUN-MIT.txt`에 있다.
- **글꼴:** Black Han Sans, Nanum Gothic Coding, Pretendard. 각 SIL OFL 전문을 웹판과 단일 HTML에 함께 넣었다.
- **문서 변환 도구:** Marked 15.0.12. 빌드할 때만 쓰고, 앱을 실행할 때 외부 라이브러리를 불러오지는 않는다. MIT 및 관련 원 고지는 `MARKED-MIT.txt`에 있다.
- **데이터가 들어 있는 HTML:** 안에 MIT 코드가 들어 있다고 해서 파일 전체를 제한 없는 MIT로 다시 배포하면 안 된다. 원자료마다 다른 표기도 위에 적은 대로 함께 남겨 주어야 한다.

## 이 안내에 대해

2026-10-23 대조·정리: FlyWire 공개 이용 지침, 공식 인용표, 사용한 주석 버전의 인용 안내, CC BY-NC 4.0 법문. 고지 항목을 꼼꼼히 맞춰 본 것이지 법률 자문은 아니며, 어떤 배포 상황에서도 문제가 없다는 보증도 아니다. 상업화나 유료 서비스, 데이터를 따로 쓰는 경우에는 권리자에게 조건을 다시 확인해 주길 바란다.

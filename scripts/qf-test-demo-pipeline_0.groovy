pipeline {
    agent any

    stages {
        stage('Run QF-Test') {
            steps {
                sh """
                QFTEST_BIN="/opt/qftest/bin/qftest"
                LOG_DIR="qftest_logs"
                REPORT_DIR="qftest_report"

                mkdir -p "${LOG_DIR}" "${REPORT_DIR}"

                "${QFTEST_BIN}" \
                  -batch \
                  -runlog "${LOG_DIR}/suite.qrz" \
                  -report "${REPORT_DIR}" \
                  suites/mySuite.qft
                """
            }
        }

        stage('Publish HTML report') {
            steps {
                publishHTML(target: [
                    reportDir: 'qftest_report',
                    reportFiles: 'index.html',
                    reportName: 'QF-Test Report',
                    keepAll: true,
                    alwaysLinkToLastBuild: true,
                ])
            }
        }
    }
}

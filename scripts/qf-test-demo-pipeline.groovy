def buildTimestamp() {
    def now = new Date()
    def fmt = new java.text.SimpleDateFormat("dd.MM.yyyy_HH-mm") // Doppelpunkt in Files vermeiden
    return fmt.format(now)
}

pipeline {
    agent any

    environment {
        TS = ""   // Platzhalter
    }

    stages {
        stage('Init timestamp') {
            steps {
                script {
                    env.TS = buildTimestamp()
                }
            }
        }

        
    
        stage('Run QF-Test') {
            steps {
                sh """
                QFTEST_BIN="C:/Program Files/QFS/QF-Test/qftest-9.0.4/bin"
                LOG_DIR="C:/projects/qftest/logs"
                REPORT_DIR="C:/projects/qftest/reports"

                mkdir -p "${LOG_DIR}" "${REPORT_DIR}"

                "${QFTEST_BIN}" \
                  -batch \
                  -runlog "${LOG_DIR}/suite.qrz" \
                  -report "${REPORT_DIR}" \
                  "C:/projects/qftest/sauceDemo.qft"
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
